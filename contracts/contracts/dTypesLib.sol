pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

library dTypesLib {

    enum dTypeRelation { Has, Link }

    struct dTypes {
        string name;
        string label;
        dTypeRelation relation;
    }

    function insert(dTypes storage self, dTypes memory dtypes) internal {
        self.name = dtypes.name;
        self.label = dtypes.label;
        self.relation = dtypes.relation;
    }

    function insertArray(dTypes[] storage self, dTypes[] memory dtypes) internal {
        uint256 length = dtypes.length;
        for (uint256 i = 0; i < length; i++) {
            self.push(dtypes[i]);
        }
    }

    function structure(string memory name, string memory label, dTypeRelation relation)
        public
        pure
        returns(dTypes memory dtypes)
    {
        return dTypes(name, label, relation);
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
