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
    }

    function structure(
        string memory name,
        LangChoices lang,
        string[] memory types,
        bool isEvent,
        bool isFunction,
        bool hasOutput,
        address contractAddress,
        bytes32 source
    )
        public
        pure
        returns(Type1 memory type1)
    {
        return Type1(lang, isEvent, isFunction, hasOutput, contractAddress, source, name, types);
    }

    function destructure(Type1 memory type1)
        public
        pure
        returns (
            string memory name,
            LangChoices lang,
            string[] memory types,
            bool isEvent,
            bool isFunction,
            bool hasOutput,
            address contractAddress,
            bytes32 source
        )
    {
        return (
            type1.name,
            type1.lang,
            type1.types,
            type1.isEvent,
            type1.isFunction,
            type1.hasOutput,
            type1.contractAddress,
            type1.source
        );
    }


}
