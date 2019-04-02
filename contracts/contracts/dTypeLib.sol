pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import './dTypesLib.sol';

library dTypeLib {
    using dTypesLib for dTypesLib.dTypes;

    enum LangChoices { Solidity, JavaScript, Python }

    enum TypeChoices {
        Type,
        Event,
        PayableFunction,
        StateFunction,
        ViewFunction,
        PureFunction
    }

    struct dType {
        LangChoices lang;
        TypeChoices typeChoice;
        address contractAddress;
        bytes32 source;
        string name;
        dTypesLib.dTypes[] types;
    }

    function insert(dType storage self, dType memory dtype) internal {
        self.lang = dtype.lang;
        self.typeChoice = dtype.typeChoice;
        self.contractAddress = dtype.contractAddress;
        self.source = dtype.source;
        self.name = dtype.name;

        dTypesLib.insertArray(self.types, dtype.types);
    }

    function structure(
        LangChoices lang,
        TypeChoices typeChoice,
        address contractAddress,
        bytes32 source,
        string memory name,
        dTypesLib.dTypes[] memory types
    )
        public
        pure
        returns(dType memory dtype)
    {
        return dType(lang, typeChoice, contractAddress, source, name, types);
    }

    function structureBytes(bytes memory data)
        pure
        internal
        returns(dType memory dtype)
    {
        (dtype) = abi.decode(data, (dType));
    }

    function destructureBytes(dType memory dtype)
        pure
        internal
        returns(bytes memory data)
    {
        return abi.encode(dtype);
    }
}
