pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

library PermissionTypeLib {

    struct PermissionTypeRequired {
        bool allowed;
    }

    struct PermissionType {
        bytes32 functionHash;
        bytes32 dataHash;
        address sender;
        bool allowed;
    }

    function insert(PermissionTypeRequired storage self, PermissionType memory permission) internal {
        self.allowed = permission.allowed;
    }

    function getDataHash(PermissionType memory permission) pure public returns(bytes32 hash) {
        return keccak256(abi.encode(
            permission.functionHash,
            permission.dataHash,
            permission.sender
        ));
    }

    function getRequired(PermissionType memory permissionFull) pure public returns(PermissionTypeRequired memory permission) {
        return PermissionTypeRequired(
            permissionFull.allowed
        );
    }

    function getFull(
        PermissionTypeRequired memory permission,
        bytes32 functionHash,
        bytes32 dataHash,
        address sender
    )
        pure
        public
        returns(PermissionType memory permissionFull)
    {
        return PermissionType(
            functionHash,
            dataHash,
            sender,
            permission.allowed
        );
    }

    function structureBytes(bytes memory data)
        pure
        public
        returns(PermissionType memory permission)
    {
        (permission) = abi.decode(data, (PermissionType));
    }

    function destructureBytes(PermissionType memory permission)
        pure
        public
        returns(bytes memory data)
    {
        return abi.encode(permission);
    }

    function map(
        address callbackAddr,
        bytes4 callbackSig,
        PermissionType[] memory permissionAarr
    )
        view
        public
        returns (PermissionType[] memory result)
    {
        uint length = permissionAarr.length;
        result = new PermissionType[](length);

        for (uint i = 0; i < length; i++) {
            (bool success, bytes memory data) = callbackAddr.staticcall(abi.encodeWithSelector(callbackSig, permissionAarr[i]));

            require(success, "Map callback failed");
            result[i] = structureBytes(data);
        }

        return result;
    }
}
