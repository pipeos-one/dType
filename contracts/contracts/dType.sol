pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import './dTypeLib.sol';
import './dTypesLib.sol';

contract dType {
    using dTypeLib for dTypeLib.dType;
    using dTypeLib for dTypeLib.LangChoices;
    using dTypesLib for dTypesLib.dTypes;

    address rootAddress;
    bytes32[] public typeIndex;
    mapping(bytes32 => Type) public typeStruct;
    mapping(bytes32 => dTypesLib.dTypes[]) public optionals;

    dTypeLib.LangChoices constant defaultLang = dTypeLib.LangChoices.Solidity;

    struct Type {
        dTypeLib.dType data;
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

    function insert(dTypeLib.dType memory data)
        public
        returns (bytes32 dataHash)
    {
        bytes32 typeHash = getTypeHash(data.lang, data.name);
        require(!isType(typeHash), 'Type already exists');

        for (uint256 i = 0 ; i < data.types.length; i++) {
            require(
                isType(getTypeHash(data.lang, data.types[i].name)),
                'A type in the composition does not exists'
            );
            require(bytes(data.types[i].name).length > 0, 'Empty type name');
            require(bytes(data.types[i].label).length > 0, 'Empty label name');
        }

        typeStruct[typeHash].data.insert(data);
        typeStruct[typeHash].index = typeIndex.push(typeHash)-1;

        emit LogNew(typeHash, typeStruct[typeHash].index);

        return typeHash;
    }

    function update(bytes32 typeHash, dTypeLib.dType memory data)
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

        // TODO remove optionals[typeHash]

        emit LogRemove(typeHash, rowToDelete);
        emit LogUpdate(keyToMove, rowToDelete);
        return rowToDelete;
    }

    function setOptionals(bytes32 typeHash, dTypesLib.dTypes[] memory optionalValues)
        typeExists(typeHash)
        public
    {
        Type storage dtype = typeStruct[typeHash];

        for (uint256 i = 0 ; i < optionalValues.length; i++) {
            require(
                isType(getTypeHash(dtype.data.lang, optionalValues[i].name)),
                'A type in the composition does not exists'
            );
            require(bytes(optionalValues[i].name).length > 0, 'Empty type name');
            require(bytes(optionalValues[i].label).length > 0, 'Empty label name');
        }
        for (uint256 i = 0 ; i < optionalValues.length; i++) {
            optionals[typeHash].push(optionalValues[i]);
        }
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

    function getOptionals(bytes32 typeHash) view public returns (dTypesLib.dTypes[] memory optionalValues) {
        return optionals[typeHash];
    }

    function getByIndex(uint256 index)
        view
        public
        returns(Type memory dtype, bytes32 typeHash)
    {
        require(index <= typeIndex.length, 'Index too big.');
        return (typeStruct[typeIndex[index]], typeIndex[index]);
    }

    function getTypeSignature(bytes32 typeHash)
        view
        public
        returns(string memory typeSignature)
    {
        return string(getEncodedTypes(typeStruct[typeHash]));
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
                    getEncodedType(dtype.data.lang, dtype.data.types[i].name),
                    ','
                );
            }
        }
        if (length > 0) {
            encoded = abi.encodePacked(
                encoded,
                getEncodedType(dtype.data.lang, dtype.data.types[length - 1].name)
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
                    getEncodedType(dtype.data.lang, dtype.data.types[i].name),
                    ','
                );
            }
        }
        if (length > 0) {
            encoded = abi.encodePacked(
                encoded,
                getEncodedType(dtype.data.lang, dtype.data.types[length - 1].name)
            );
        }
        encoded = abi.encodePacked(dtype.data.name, '(', encoded, ')');
        return bytes4(keccak256(encoded));
    }

    function run(bytes32 funcHash, bytes32[] memory inDataHash)
        public
        returns(bytes32 outDataHash)
    {
        Type storage dtype = typeStruct[funcHash];

        bytes memory encodedInputs = abi.encodePacked(getSignature(funcHash));

        require(inDataHash.length == dtype.data.types.length, 'Incorrect number of inputs');

        // Retrieve inputs for calling the function at funcHash
        for (uint256 i = 0; i < dtype.data.types.length; i++) {
            bytes32 typeHash = getTypeHash(dtype.data.lang, dtype.data.types[i].name);
            Type storage ttype = typeStruct[typeHash];

            (bool success, bytes memory inputData) = ttype.data.contractAddress.call(
                abi.encodeWithSignature('getByHash(bytes32)', inDataHash[i])
            );
            require(success == true, 'Retrieving input failed');
            encodedInputs = abi.encodePacked(encodedInputs, inputData);
        }

        // Calling the function determined by funcHash
        (bool success, bytes memory outputData) = dtype.data.contractAddress.call(encodedInputs);
        require(success == true, 'Running function failed');

        // Inserting the funcHash outputs into the corresponding type storage
        bytes32 outputHash = getTypeHash(dtype.data.lang, optionals[funcHash][0].name);
        (bool success2, bytes memory result) =  typeStruct[outputHash].data.contractAddress.call(
            abi.encodeWithSignature('insertBytes(bytes)', outputData)
        );
        require(success2 == true, 'Inserting output failed');

        return abi.decode(result, (bytes32));
    }

    function map(bytes32 funcHash, bytes32[][] memory inDataHash)
        public
        returns(bytes32[] outDataHash)
    {
        for (uint256 i = 0; i < inDataHash.length; i++) {
            outDataHash[i] = run(funcHash, inDataHash[i]);
        }
    }
}
