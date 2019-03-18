pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

library dTypeLib{

    enum LangChoices { Solidity, JavaScript, Python }
    struct Type1 {
        string name;
        LangChoices lang;
        bytes32[] types;
        bool isEvent;
        bool isFunction;
        bool hasOutput;
        address contractAddress;
        bytes32 source;
    }



    function structure(
        string memory name,
        LangChoices lang,
        bytes32[] memory types,
        bool isEvent,
        bool isFunction,
        bool hasOutput,
        address contractAddress,
        bytes32 source
    ) public pure returns(Type1 memory type1){
        return Type1(name,lang,types,isEvent,isFunction,hasOutput,contractAddress,source);
    }

    function destructure(Type1 memory type1) public pure returns (
        string memory name,
        LangChoices lang,
        bytes32[] memory types,
        bool isEvent,
        bool isFunction,
        bool hasOutput,
        address contractAddress,
        bytes32 source
    ){
        return (
            type1.name,type1.lang,type1.types,type1.isEvent,
            type1.isFunction,type1.hasOutput,type1.contractAddress,type1.source
        );
    }


}
