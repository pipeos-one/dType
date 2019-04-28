pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

library PermissionDataLib {

    struct PermissionDataRequired {
        bool anyone;
        address allowed;
    }

    struct PermissionData {
        address contractAddress;
        bytes4 functionHash;
        bytes32 dataHash;
        bool anyone;
        address allowed;
    }

    function insert(PermissionDataRequired storage self, PermissionData memory permission) internal {
        self.anyone = permission.anyone;
        self.allowed = permission.allowed;
    }

    function getDataHash(PermissionData memory permission) pure public returns(bytes32 hash) {
        return keccak256(abi.encode(
            permission.contractAddress,
            permission.functionHash,
            permission.dataHash
        ));
    }

    function getRequired(PermissionData memory permissionFull) pure public returns(PermissionDataRequired memory permission) {
        return PermissionDataRequired(
            permissionFull.anyone,
            permissionFull.allowed
        );
    }

    function structureBytes(bytes memory data)
        pure
        public
        returns(PermissionData memory permission)
    {
        (permission) = abi.decode(data, (PermissionData));
    }

    function destructureBytes(PermissionData memory permission)
        pure
        public
        returns(bytes memory data)
    {
        return abi.encode(permission);
    }
}
