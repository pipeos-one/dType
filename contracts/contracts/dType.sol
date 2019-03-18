pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

contract dType {
    bytes32[] public typeIndex;
    mapping(bytes32 => Type) public typeStruct;
    mapping(bytes32 => string[]) public outputIndex;

    enum LangChoices { Solidity, JavaScript, Python }
    LangChoices constant defaultLang = LangChoices.Solidity;

    struct Type {
        LangChoices lang;
        bool isEvent;
        bool isFunction;
        bool hasOutput;
        address contractAddress;
        bytes32 source;
        uint256 index;
        string name;
        string[] types;
    }

    modifier typeExists (bytes32 typeHash) {
        require(isType(typeHash), 'No such type inserted');
        _;
    }

    modifier typeNotExists (bytes32 typeHash) {
        require(!isType(typeHash), 'Type already exists');
        _;
    }

    event LogNew(
        bytes32 indexed typeHash,
        uint256 index,
        string name,
        string[] types
    );

    event LogUpdate(
        bytes32 indexed typeHash,
        uint index,
        string name,
        string[] types
    );

    event LogRemove(
        bytes32 indexed typeHash,
        uint256 index
    );

    function insert(
        LangChoices lang,
        string memory name,
        string[] memory types,
        bool isEvent,
        bool isFunction,
        bool hasOutput,
        address contractAddress,
        bytes32 source
    )
        public
        returns(uint256 index)
    {
        bytes32 typeHash = getTypeHash(lang, name);
        require(!isType(typeHash), 'Type already exists');

        for (uint256 i = 0 ; i < types.length; i++) {
            if (!isType(getTypeHash(lang, types[i])) && bytes(types[i]).length > 0) {
                revert("A type in the composition does not exists. Use only extant types.");
            }
        }
        typeStruct[typeHash].lang = lang;
        typeStruct[typeHash].isEvent = isEvent;
        typeStruct[typeHash].isFunction = isFunction;
        typeStruct[typeHash].hasOutput = hasOutput;
        typeStruct[typeHash].name = name;
        typeStruct[typeHash].types = types;
        typeStruct[typeHash].contractAddress = contractAddress;
        typeStruct[typeHash].source = source;
        typeStruct[typeHash].index = typeIndex.push(typeHash)-1;

        emit LogNew(
            typeHash,
            typeStruct[typeHash].index,
            name,
            types
        );

        return typeIndex.length-1;
    }

    function update(
        bytes32 typeHash,
        string memory newName,
        string[] memory newTypes
    )
        public
        returns(bool success)
    {
        return (
            updateTypes(typeHash, newTypes) &&
            updateName(typeHash, newName)
        );
    }

    function updateTypes(
        bytes32 typeHash,
        string[] memory newTypes
    )
        typeExists(typeHash)
        public
        returns(bool success)
    {
        typeStruct[typeHash].types = newTypes;

        emit LogUpdate(
            typeHash,
            typeStruct[typeHash].index,
            typeStruct[typeHash].name,
            typeStruct[typeHash].types
        );

        return true;
    }

    function updateName(
        bytes32 typeHash,
        string memory newName
    )
        typeExists(typeHash)
        public
        returns(bool success)
    {
        Type memory dtype = typeStruct[typeHash];
        bytes32 newTypeHash = getTypeHash(dtype.lang, newName);

        if (newTypeHash == typeHash) return false;

        typeStruct[newTypeHash] = dtype;
        typeStruct[newTypeHash].name = newName;
        typeIndex[typeStruct[newTypeHash].index] = newTypeHash;
        delete typeStruct[typeHash];

        emit LogUpdate(
            typeHash,
            typeStruct[newTypeHash].index,
            typeStruct[newTypeHash].name,
            typeStruct[newTypeHash].types
        );

        return true;
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
        emit LogUpdate(
            keyToMove,
            rowToDelete,
            typeStruct[keyToMove].name,
            typeStruct[keyToMove].types
        );
        return rowToDelete;
    }

    function setOutputs(bytes32 typeHash, string[] memory outputs)
        typeExists(typeHash)
        public
    {
        Type storage dtype = typeStruct[typeHash];

        require(typeStruct[typeHash].hasOutput == true, 'type has no output');

        for (uint256 i = 0 ; i < outputs.length; i++) {
            require(
                isType(getTypeHash(dtype.lang, outputs[i])) &&
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

    function getTypeHash(LangChoices lang, string memory name)
        pure
        public
        returns (bytes32 typeHash)
    {
        return keccak256(abi.encode(lang, name));
    }

    function getByHash(bytes32 typeHash) view public returns(Type memory dtype) {
        return typeStruct[typeHash];
    }

    function get(LangChoices lang, string memory name)
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
       return typeStruct[typeHash].types;
    }

    function getByIndex(uint256 index)
        view
        public
        returns(Type memory dtype, bytes32 typeHash)
    {
        if(index > typeIndex.length ) {
            revert("Index too big.");
        }
        return (typeStruct[typeIndex[index]],  typeIndex[index]);
    }

    function getSignature(bytes32 typeHash)
        view
        public
        returns (bytes4 signature)
    {
        Type storage dtype = typeStruct[typeHash];
        bytes memory encoded = abi.encodePacked(dtype.name, '(');

        if (dtype.types.length > 1) {
            for (uint256 i = 0; i < dtype.types.length - 1; i++)  {
                encoded = abi.encodePacked(encoded, dtype.types[i], ',');
            }
        }
        if (dtype.types.length > 0) {
            encoded = abi.encodePacked(encoded, dtype.types[dtype.types.length - 1]);
        }
        encoded = abi.encodePacked(encoded, ')');
        return bytes4(keccak256(encoded));
    }
}
