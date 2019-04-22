pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "./lib/ECVerify.sol";
import './dTypeLib.sol';
import './dTypesLib.sol';

contract dType {
    using dTypeLib for dTypeLib.dType;
    using dTypeLib for dTypeLib.dTypeRequired;
    using dTypeLib for dTypeLib.LangChoices;
    using dTypesLib for dTypesLib.dTypes;

    address rootAddress;
    bytes32[] public typeIndex;
    mapping(bytes32 => Type) public typeStruct;
    mapping(bytes32 => dTypesLib.dTypes[]) public optionals;
    mapping(bytes32 => dTypesLib.dTypes[]) public outputs;

    dTypeLib.LangChoices constant defaultLang = dTypeLib.LangChoices.Solidity;

    struct Type {
        dTypeLib.dTypeRequired data;
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

        checkTypesExist(data.lang, data.types);

        typeStruct[typeHash].data.insert(data);
        typeStruct[typeHash].index = typeIndex.push(typeHash)-1;

        setOptionals(typeHash, data.optionals);
        setOutputs(typeHash, data.outputs);

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

        delete optionals[typeHash];
        delete outputs[typeHash];

        emit LogRemove(typeHash, rowToDelete);
        emit LogUpdate(keyToMove, rowToDelete);
        return rowToDelete;
    }

    function setOptionals(bytes32 typeHash, dTypesLib.dTypes[] memory optionalValues)
        typeExists(typeHash)
        public
    {
        Type storage dtype = typeStruct[typeHash];
        checkTypesExist(dtype.data.lang, optionalValues);

        for (uint256 i = 0 ; i < optionalValues.length; i++) {
            optionals[typeHash].push(optionalValues[i]);
        }
    }

    function setOutputs(bytes32 typeHash, dTypesLib.dTypes[] memory outputValues)
        typeExists(typeHash)
        public
    {
        Type storage dtype = typeStruct[typeHash];
        checkTypesExist(dtype.data.lang, outputValues);

        for (uint256 i = 0 ; i < outputValues.length; i++) {
            outputs[typeHash].push(outputValues[i]);
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

    function getByHash(bytes32 typeHash) view public returns(dTypeLib.dType memory dtype) {
        return typeStruct[typeHash].data.getFull(
            getOptionals(typeHash),
            getOutputs(typeHash)
        );
    }

    function get(dTypeLib.LangChoices lang, string memory name)
        view
        public
        returns(dTypeLib.dType memory dtype)
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

    function getOutputs(bytes32 typeHash) view public returns (dTypesLib.dTypes[] memory outputValues) {
        return outputs[typeHash];
    }

    function getByIndex(uint256 index)
        view
        public
        returns(dTypeLib.dType memory dtype, bytes32 typeHash)
    {
        require(index <= typeIndex.length, 'Index too big.');
        return (getByHash(typeIndex[index]), typeIndex[index]);
    }

    function checkTypesExist(dTypeLib.LangChoices lang, dTypesLib.dTypes[] memory types)
        view
        public
    {
        for (uint256 i = 0 ; i < types.length; i++) {
            require(
                isType(getTypeHash(lang, types[i].name)),
                'A type in the composition does not exists'
            );
            require(bytes(types[i].name).length > 0, 'Empty type name');
            require(bytes(types[i].label).length > 0, 'Empty label name');
        }
    }

    function getTypeSignature(bytes32 typeHash)
        view
        public
        returns(string memory typeSignature)
    {
        return string(getEncodedTypes(typeStruct[typeHash]));
    }

    function getEncodedType(dTypeLib.LangChoices lang, string memory name, string[] memory dimensions)
        view
        public
        returns(bytes memory encoded)
    {
        Type storage dtype = typeStruct[getTypeHash(lang, name)];

        if (dtype.data.types.length == 0) {
            encoded = abi.encodePacked(dtype.data.name);
            return abi.encodePacked(encoded, typeDimensionsToString(dimensions));
        }

        encoded = getEncodedTypes(dtype);
        encoded = abi.encodePacked('(', encoded, ')');
        encoded = abi.encodePacked(encoded, typeDimensionsToString(dimensions));
    }

    function typeDimensionsToString(string[] memory dimensions)
        pure
        public
        returns(bytes memory encoded)
    {
        for (uint256 i = 0; i < dimensions.length; i++) {
            encoded = abi.encodePacked(encoded, '[', dimensions[i], ']');
        }
    }

    function getEncodedTypes(Type storage dtype)
        view
        internal
        returns(bytes memory encoded)
    {
        uint256 length = dtype.data.types.length;
        dTypesLib.dTypes[] storage typeOptionals = optionals[typeIndex[dtype.index]];
        uint256 lengthOpt = typeOptionals.length;

        for (uint256 i = 0; i < length; i++) {
            encoded = abi.encodePacked(
                encoded,
                getEncodedType(
                    dtype.data.lang,
                    dtype.data.types[i].name,
                    dtype.data.types[i].dimensions
                )
            );
            if (i < length - 1 || lengthOpt > 0) {
                encoded = abi.encodePacked(encoded, ',');
            }
        }

        for (uint256 i = 0; i < lengthOpt; i++) {
            encoded = abi.encodePacked(
                encoded,
                getEncodedType(
                    dtype.data.lang,
                    typeOptionals[i].name,
                    typeOptionals[i].dimensions
                )
            );
            if (i < lengthOpt - 1) {
                encoded = abi.encodePacked(encoded, ',');
            }
        }
    }

    function getSignatureFull(bytes32 typeHash)
        view
        public
        returns (bytes memory signature)
    {
        Type storage dtype = typeStruct[typeHash];
        bytes memory encoded;
        uint256 length = dtype.data.types.length;
        uint256 lengthOpt = optionals[typeHash].length;

        for (uint256 i = 0; i < length; i++)  {
            encoded = abi.encodePacked(
                encoded,
                getEncodedType(
                    dtype.data.lang,
                    dtype.data.types[i].name,
                    dtype.data.types[i].dimensions
                )
            );
            if (i < length - 1 || lengthOpt > 0) {
                encoded = abi.encodePacked(encoded, ',');
            }
        }

        encoded = abi.encodePacked(dtype.data.name, '(', encoded, ')');
        return encoded;
    }

    function getSignature(bytes32 typeHash)
        view
        public
        returns (bytes4 signature)
    {
        return bytes4(keccak256(getSignatureFull(typeHash)));
    }

    function run(bytes32 funcHash, bytes32[] memory inDataHash, bytes memory freeInputs)
        public
        returns(bytes32 outDataHash)
    {
        bytes memory outputData = runView(funcHash, inDataHash, freeInputs);
        Type storage dtype = typeStruct[funcHash];

        // Inserting the funcHash outputs into the corresponding type storage
        bytes32 outputHash = getTypeHash(dtype.data.lang, outputs[funcHash][0].name);
        (bool success2, bytes memory result) =  typeStruct[outputHash].data.contractAddress.call(
            abi.encodeWithSignature('insertBytes(bytes)', outputData)
        );
        require(success2 == true, 'Inserting output failed');

        return abi.decode(result, (bytes32));
    }

    function runSecure(bytes32 funcHash, bytes32[] memory inDataHash, bytes memory freeInputs, bytes memory signature)
        public
        returns(bytes32 outDataHash)
    {
        address senderAddress = recoverAddress(freeInputs, signature);
        Type storage dtype = typeStruct[funcHash];

        freeInputs = abi.encodePacked(freeInputs, abi.encode(senderAddress));
        return run(funcHash, inDataHash, freeInputs);
    }

    function pipeView(bytes32[] memory inDataHash, bytes32[] memory funcHash)
        public
        view
        returns(bytes memory result)
    {
        result = getPackedInputs(typeStruct[funcHash[0]], inDataHash);

        for (uint256 i = 0; i < funcHash.length; i++) {
            Type storage dtype = typeStruct[funcHash[i]];
            result = runViewRaw(funcHash[i], dtype, result);
        }
        return result;
    }

    function runView(bytes32 funcHash, bytes32[] memory inDataHash, bytes memory freeInputs)
        public
        view
        returns(bytes memory result)
    {
        Type storage dtype = typeStruct[funcHash];
        return runViewRaw(
            funcHash,
            dtype,
            abi.encodePacked(getPackedInputs(dtype, inDataHash), freeInputs)
        );
    }

    function runViewRaw(
        bytes32 funcHash,
        Type storage dtype,
        bytes memory inputs
    )
        private
        view
        returns(bytes memory outputData)
    {
        inputs = abi.encodePacked(getSignature(funcHash), inputs);

        // Calling the function determined by funcHash
        (bool success, bytes memory result) = dtype.data.contractAddress.staticcall(inputs);
        require(success == true, 'Running function failed');

        return result;
    }

    function getPackedInputs(Type storage dtype, bytes32[] memory inDataHash) private view returns(bytes memory inputs) {
        require(inDataHash.length == dtype.data.types.length, 'Incorrect number of inputs');

        // Retrieve inputs for calling the function at funcHash
        for (uint256 i = 0; i < dtype.data.types.length; i++) {
            bytes32 typeHash = getTypeHash(dtype.data.lang, dtype.data.types[i].name);
            Type storage ttype = typeStruct[typeHash];

            (bool success, bytes memory inputData) = ttype.data.contractAddress.staticcall(
                abi.encodeWithSignature('getByHash(bytes32)', inDataHash[i])
            );
            require(success == true, 'Retrieving input failed');
            inputs = abi.encodePacked(inputs, inputData);
        }
    }

    function recoverAddress(bytes memory data, bytes memory signature) private pure returns(address senderAddress) {
        // TODO fix signature security
        // chain_id, some identifiers for the purpose of the function
        // ideally a nonce (tx.nonce ftw!);
        senderAddress = ECVerify.ecverify(keccak256(data), signature);
    }
}
