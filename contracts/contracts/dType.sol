pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import './dTypeLib.sol';

contract dType {
    using dTypeLib for dTypeLib.DType;
    using dTypeLib for dTypeLib.LangChoices;

    address rootAddress;
    bytes32[] public typeIndex;
    mapping(bytes32 => Type) public typeStruct;
    mapping(bytes32 => string[]) public outputIndex;

    dTypeLib.LangChoices constant defaultLang = dTypeLib.LangChoices.Solidity;

    struct Type {
        dTypeLib.DType data;
        uint256 index;
    }

    modifier typeExists (bytes32 typeHash) {
        require(isType(typeHash), 'No such type inserted');
        _;
    }

    modifier typeNotExists (bytes32 typeHash) {
        require(!isType(typeHash), 'Type already exists');
        _;
    }

    event LogNew(bytes32 indexed hash, uint256 indexed index);
    event LogUpdate(bytes32 indexed hash, uint256 indexed index);
    event LogRemove(bytes32 indexed hash, uint256 indexed index);

    function setRootAddress(address root) public {
        rootAddress = root;
    }

    function insert(dTypeLib.DType memory data)
        public
        returns (bytes32 dataHash)
    {
        bytes32 typeHash = getTypeHash(data.lang, data.name);
        require(!isType(typeHash), 'Type already exists');
        require(data.types.length == data.labels.length);

        for (uint256 i = 0 ; i < data.types.length; i++) {
            require(
                isType(getTypeHash(data.lang, data.types[i])) && bytes(data.types[i]).length > 0,
                "A type in the composition does not exists. Use only extant types."
            );
        }
        typeStruct[typeHash].data = data;
        typeStruct[typeHash].index = typeIndex.push(typeHash)-1;

        emit LogNew(typeHash, typeStruct[typeHash].index);

        return typeHash;
    }

    function updateTypes(
        bytes32 typeHash,
        string[] memory newTypes
    )
        typeExists(typeHash)
        public
        returns(bool success)
    {
        typeStruct[typeHash].data.types = newTypes;

        emit LogUpdate(typeHash, typeStruct[typeHash].index);

        return true;
    }

    function update(bytes32 typeHash, dTypeLib.DType memory data)
        public
        returns(bytes32 hash)
    {
        remove(typeHash);
        return insert(data);
    }

    function remove(bytes32 typeHash)
        typeExists(typeHash)
        public
        returns(uint256 index)
    {
        uint rowToDelete = typeStruct[typeHash].index;
        bytes32 keyToMove = typeIndex[typeIndex.length-1];
        typeIndex[rowToDelete] = keyToMove;
        typeStruct[keyToMove].index = rowToDelete;
        typeIndex.length--;

        // TODO remove outputIndex[typeHash]

        emit LogRemove(typeHash, rowToDelete);
        emit LogUpdate(keyToMove, rowToDelete);
        return rowToDelete;
    }

    function setOutputs(bytes32 typeHash, string[] memory outputs)
        typeExists(typeHash)
        public
    {
        Type storage dtype = typeStruct[typeHash];

        require(typeStruct[typeHash].data.hasOutput == true, 'type has no output');

        for (uint256 i = 0 ; i < outputs.length; i++) {
            require(
                isType(getTypeHash(dtype.data.lang, outputs[i])) &&
                bytes(outputs[i]).length > 0,
                'A type in the composition does not exists. Use only extant types.'
            );
        }
        outputIndex[typeHash] = outputs;
    }

    function count() public view returns(uint256 counter)
    {
        return typeIndex.length;
    }

    function getIndex() public view returns(bytes32[] memory indext) {
        return typeIndex;
    }

    function getTypeHash(dTypeLib.LangChoices lang, string memory name)
        pure
        public
        returns (bytes32 typeHash)
    {
        return keccak256(abi.encode(lang, name));
    }

    function getByHash(bytes32 typeHash) view public returns(Type memory dtype) {
        return typeStruct[typeHash];
    }

    function get(dTypeLib.LangChoices lang, string memory name)
        view
        public
        returns(Type memory dtype)
    {
        bytes32 typeHash = getTypeHash(lang, name);
        return getByHash(typeHash);
    }

    function isType(bytes32 typeHash)
        view
        public
        returns(bool isIndeed)
    {
        if (typeIndex.length == 0) {
            return false;
        }
        return (typeIndex[typeStruct[typeHash].index] == typeHash);
    }

    function getOutputs(bytes32 typeHash) view public returns (string[] memory outputs) {
        return outputIndex[typeHash];
    }

    function getTypes(bytes32 typeHash)
        public
        view
        returns(string[] memory types)
    {
       return typeStruct[typeHash].data.types;
    }

    function getByIndex(uint256 index)
        view
        public
        returns(Type memory dtype, bytes32 typeHash)
    {
        require(index <= typeIndex.length, "Index too big.");
        return (typeStruct[typeIndex[index]], typeIndex[index]);
    }

    function getEncodedType(dTypeLib.LangChoices lang, string memory name)
        view
        internal
        returns(bytes memory encoded)
    {
        Type storage dtype = typeStruct[getTypeHash(lang, name)];

        if (dtype.data.types.length > 0) {
            return getEncodedTypes(dtype);
        }
        return abi.encodePacked(dtype.data.name);
    }

    function typeIsArray(string memory name) pure public returns(bool isArray) {
        bytes memory encoded = bytes(name);
        uint256 length = encoded.length;

        if (
            encoded[length-2] == bytes1(0x5b) &&
            encoded[length-1] == bytes1(0x5d)
        ) {
            return true;
        }
        return false;
    }

    function getEncodedTypes(Type storage dtype)
        view
        internal
        returns(bytes memory encoded)
    {
        uint256 length = dtype.data.types.length;

        if (length > 1) {
            for (uint256 i = 0; i < length - 1; i++) {
                encoded = abi.encodePacked(
                    encoded,
                    getEncodedType(dtype.data.lang, dtype.data.types[i]),
                    ','
                );
            }
        }
        if (length > 0) {
            encoded = abi.encodePacked(
                encoded,
                getEncodedType(dtype.data.lang, dtype.data.types[length - 1])
            );
        }

        // If type is an array, we need to append [] instead of enclosing in brackets
        if (typeIsArray(dtype.data.name)) {
            encoded = abi.encodePacked(encoded, '[]');
        } else {
            encoded = abi.encodePacked('(', encoded, ')');
        }
        return encoded;
    }

    function getSignature(bytes32 typeHash)
        view
        public
        returns (bytes4 signature)
    {
        Type storage dtype = typeStruct[typeHash];
        bytes memory encoded;
        uint256 length = dtype.data.types.length;

        if (length > 1) {
            for (uint256 i = 0; i < length - 1; i++)  {
                encoded = abi.encodePacked(
                    encoded,
                    getEncodedType(dtype.data.lang, dtype.data.types[i]),
                    ','
                );
            }
        }
        if (length > 0) {
            encoded = abi.encodePacked(
                encoded,
                getEncodedType(dtype.data.lang, dtype.data.types[length - 1])
            );
        }
        encoded = abi.encodePacked(dtype.data.name, '(', encoded, ')');
        return bytes4(keccak256(encoded));
    }

    function run(bytes32 funcHash, bytes32[] memory dataHash)
        public
        // bytes32[] outputDataHash
        returns(bytes32 dataHash2)
    {
        Type storage dtype = typeStruct[funcHash];

        bytes memory encodedInputs = abi.encodePacked(getSignature(funcHash));

        require(dataHash.length == dtype.data.types.length);

        for (uint256 i = 0; i < dtype.data.types.length; i++) {
            bytes32 typeHash = getTypeHash(dtype.data.lang, dtype.data.types[i]);
            Type storage ttype = typeStruct[typeHash];

            (bool success, bytes memory inputData) = ttype.data.contractAddress.call(
                abi.encodeWithSignature("getByHash(bytes32)", dataHash[i])
            );
            require(success == true);
            encodedInputs = abi.encodePacked(encodedInputs, inputData);
        }

        (bool success, bytes memory outputData) = dtype.data.contractAddress.call(encodedInputs);
        require(success == true);

        // TODO multiple outputs, safe guards
        bytes32 outputHash = getTypeHash(dtype.data.lang, outputIndex[funcHash][0]);
        (bool success2, bytes memory result) =  typeStruct[outputHash].data.contractAddress.call(
            abi.encodeWithSignature("insertBytes(bytes)", outputData)
        );
        require(success2 == true);

        return abi.decode(result, (bytes32));
    }
}
