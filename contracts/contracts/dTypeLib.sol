pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

library dTypeLib {

    enum LangChoices { Solidity, JavaScript, Python }

    struct Type1 {
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
        returns(Type1 memory type1)
    {
        return Type1(lang, isEvent, isFunction, hasOutput, contractAddress, source, name, types, labels);
    }

    function structureBytes(bytes memory data)
        pure
        internal
        returns(Type1 memory type1)
    {
        (type1) = abi.decode(data, (Type1));
    }

    function destructureBytes(Type1 memory type1)
        pure
        internal
        returns(bytes memory data)
    {
        return abi.encode(type1);
    }
}
