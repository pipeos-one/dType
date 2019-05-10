pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

library dTypesLib {

    enum dTypeRelation { Has, Link, Bytes }

    struct dTypes {
        string name;
        string label;
        dTypeRelation relation;
        string[] dimensions;
    }

    function insert(dTypes storage self, dTypes memory dtypes) internal {
        self.name = dtypes.name;
        self.label = dtypes.label;
        self.relation = dtypes.relation;
        if (dtypes.dimensions.length > 0) {
            self.dimensions = dtypes.dimensions;
        }
    }

    function insertArray(dTypes[] storage self, dTypes[] memory dtypes) internal {
        uint256 length = dtypes.length;
        for (uint256 i = 0; i < length; i++) {
            self.push(dtypes[i]);
        }
    }

    function structure(string memory name, string memory label, dTypeRelation relation, string[] memory dimensions)
        public
        pure
        returns(dTypes memory dtypes)
    {
        return dTypes(name, label, relation, dimensions);
    }

    function structureBytes(bytes memory data)
        pure
        internal
        returns(dTypes memory dtypes)
    {
        (dtypes) = abi.decode(data, (dTypes));
    }

    function destructureBytes(dTypes memory dtypes)
        pure
        internal
        returns(bytes memory data)
    {
        return abi.encode(dtypes);
    }
}
