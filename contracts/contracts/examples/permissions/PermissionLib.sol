pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import './PermissionProcessLib.sol';

library PermissionLib {

    struct PermissionRequired {
        bool anyone;
        address allowed;
    }

    struct PermissionFull {
        bool anyone;
        address allowed;
        PermissionProcessLib.PermissionProcess permissionProcess;
    }

    struct PermissionIdentifier {
        address contractAddress;
        bytes4 functionSig;
        bytes32 transitionHash;
        bytes32 dataHash;
    }

    struct Permission {
        address contractAddress;
        bytes4 functionSig;
        bytes32 transitionHash;
        bytes32 dataHash;
        bool anyone;
        address allowed;
        PermissionProcessLib.PermissionProcess permissionProcess;
    }

    function insert(PermissionRequired storage self, Permission memory permission) internal {
        self.anyone = permission.anyone;
        self.allowed = permission.allowed;
    }

    function getRequired(Permission memory permissionFull) pure public returns(PermissionRequired memory permission) {
        return PermissionRequired(
            permissionFull.anyone,
            permissionFull.allowed
        );
    }

    function getRequired(PermissionFull memory permissionFull) pure public returns(PermissionRequired memory permission) {
        return PermissionRequired(
            permissionFull.anyone,
            permissionFull.allowed
        );
    }

    function getFull(Permission memory permissionFull) pure public returns(PermissionFull memory permission) {
        return PermissionFull(
            permissionFull.anyone,
            permissionFull.allowed,
            permissionFull.permissionProcess
        );
    }

    function getFull(PermissionRequired memory permission, PermissionProcessLib.PermissionProcess memory permissionProcess) pure public returns(PermissionFull memory permissionFull) {
        return PermissionFull(
            permission.anyone,
            permission.allowed,
            permissionProcess
        );
    }

    function getDataHash(PermissionIdentifier memory identifier) pure public returns(bytes32 hash) {
        return keccak256(abi.encode(
            identifier.contractAddress,
            identifier.functionSig,
            identifier.transitionHash,
            identifier.dataHash
        ));
    }

    function getDataHash(Permission memory permission) pure public returns(bytes32 hash) {
        return keccak256(abi.encode(
            permission.contractAddress,
            permission.functionSig,
            permission.transitionHash,
            permission.dataHash
        ));
    }

    function structureBytes(bytes memory data)
        pure
        public
        returns(Permission memory dataStruct)
    {
        (dataStruct) = abi.decode(data, (Permission));
    }

    function destructureBytes(Permission memory dataStruct)
        pure
        public
        returns(bytes memory data)
    {
        return abi.encode(dataStruct);
    }
}
