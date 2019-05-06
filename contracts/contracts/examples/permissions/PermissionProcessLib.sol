pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

library PermissionProcessLib {

    struct PermissionProcess {
        bytes4 temporaryAction;
        bytes32 votingProcessDataHash;
        bytes32 functionHashPermission;
        bytes32[] allowedTransitions;
    }

    function insert(PermissionProcess storage self, PermissionProcess memory permission) internal {
        self.temporaryAction = permission.temporaryAction;
        self.votingProcessDataHash = permission.votingProcessDataHash;
        self.functionHashPermission = permission.functionHashPermission;
        self.allowedTransitions = permission.allowedTransitions;
    }

    function getDataHash(PermissionProcess memory permission) pure public returns(bytes32 hash) {
        return keccak256(abi.encode(permission));
    }

    function structureBytes(bytes memory data)
        pure
        public
        returns(PermissionProcess memory dataStruct)
    {
        (dataStruct) = abi.decode(data, (PermissionProcess));
    }

    function destructureBytes(PermissionProcess memory dataStruct)
        pure
        public
        returns(bytes memory data)
    {
        return abi.encode(dataStruct);
    }
}
