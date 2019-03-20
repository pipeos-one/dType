pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

library dTypeLib {

    enum LangChoices { Solidity, JavaScript, Python }

    struct DType {
        LangChoices lang;
        bool isEvent;
        bool isFunction;
        bool hasOutput;
        address contractAddress;
        bytes32 source;
        string name;
        string[] types;
        string[] labels;
    }

    function structure(
        LangChoices lang,
        bool isEvent,
        bool isFunction,
        bool hasOutput,
        address contractAddress,
        bytes32 source,
        string memory name,
        string[] memory types,
        string[] memory labels
    )
        public
        pure
        returns(DType memory dtype)
    {
        return DType(lang, isEvent, isFunction, hasOutput, contractAddress, source, name, types, labels);
    }

    function structureBytes(bytes memory data)
        pure
        internal
        returns(DType memory dtype)
    {
        (dtype) = abi.decode(data, (DType));
    }

    function destructureBytes(DType memory dtype)
        pure
        internal
        returns(bytes memory data)
    {
        return abi.encode(dtype);
    }
}
