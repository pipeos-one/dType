pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import './dTypesLib.sol';

library dTypeLib {
    using dTypesLib for dTypesLib.dTypes;

    enum LangChoices { Solidity, JavaScript, Python }

    enum TypeChoices {
        BaseType,
        PayableFunction,
        StateFunction,
        ViewFunction,
        PureFunction,
        Event,
        MappingType
    }

    struct dTypeRequired {
        LangChoices lang;
        TypeChoices typeChoice;
        address contractAddress;
        bytes32 source;
        string name;
        dTypesLib.dTypes[] types;
    }

    struct dType {
        LangChoices lang;
        TypeChoices typeChoice;
        address contractAddress;
        bytes32 source;
        string name;
        // required types
        dTypesLib.dTypes[] types;
        // optional types
        dTypesLib.dTypes[] optionals;
        // function outputs
        dTypesLib.dTypes[] outputs;
    }

    function insert(dTypeRequired storage self, dType memory dtype) internal {
        self.lang = dtype.lang;
        self.typeChoice = dtype.typeChoice;
        self.contractAddress = dtype.contractAddress;
        self.source = dtype.source;
        self.name = dtype.name;

        dTypesLib.insertArray(self.types, dtype.types);
    }

    function getRequired(dType memory dtypeFull) pure public returns(dTypeRequired memory dtype) {
        return dTypeRequired(
            dtypeFull.lang,
            dtypeFull.typeChoice,
            dtypeFull.contractAddress,
            dtypeFull.source,
            dtypeFull.name,
            dtypeFull.types
        );
    }

    function getFull(
        dTypeRequired memory dtype,
        dTypesLib.dTypes[] memory optionals,
        dTypesLib.dTypes[] memory outputs
    ) pure public returns(dType memory dtypeFull) {
        return dType(
            dtype.lang,
            dtype.typeChoice,
            dtype.contractAddress,
            dtype.source,
            dtype.name,
            dtype.types,
            optionals,
            outputs
        );
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
