pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

library PermissionFunctionLib {

    struct PermissionFunctionRequired {
        bool anyone;
        address allowed;
        bytes4 temporaryAction;
        bytes32 votingProcessDataHash;
    }

    struct PermissionFunction {
        address contractAddress;
        bytes4 functionSig;
        bool anyone;
        address allowed;
        bytes4 temporaryAction;
        bytes32 votingProcessDataHash;
    }

    struct PermissionFunctionIdentifier {
        address contractAddress;
        bytes4 functionSig;
    }

    function insert(PermissionFunctionRequired storage self, PermissionFunction memory permission) internal {
        self.anyone = permission.anyone;
        self.allowed = permission.allowed;
        self.temporaryAction = permission.temporaryAction;
        self.votingProcessDataHash = permission.votingProcessDataHash;
    }

    function getDataHash(PermissionFunction memory permission) pure public returns(bytes32 hash) {
        return keccak256(abi.encode(
            permission.contractAddress,
            permission.functionSig
        ));
    }

    function getDataHash(PermissionFunctionIdentifier memory identifier) pure public returns(bytes32 hash) {
        return keccak256(abi.encode(
            identifier.contractAddress,
            identifier.functionSig
        ));
    }

    function getRequired(PermissionFunction memory permissionFull) pure public returns(PermissionFunctionRequired memory permission) {
        return PermissionFunctionRequired(
            permissionFull.anyone,
            permissionFull.allowed,
            permissionFull.temporaryAction,
            permissionFull.votingProcessDataHash
        );
    }

    function structureBytes(bytes memory data)
        pure
        public
        returns(PermissionFunction memory permission)
    {
        (permission) = abi.decode(data, (PermissionFunction));
    }

    function destructureBytes(PermissionFunction memory permission)
        pure
        public
        returns(bytes memory data)
    {
        return abi.encode(permission);
    }
}
