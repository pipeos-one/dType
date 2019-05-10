pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import './PermissionLib.sol';

interface PermissionStorageInterface {
    function insert(PermissionLib.Permission calldata data) external returns (bytes32 hash);

    function update(bytes32 hashi, PermissionLib.Permission calldata data) external returns(bytes32 hash);

    function remove(bytes32 hash) external returns(uint256 index);

    function count() external view returns(uint256 counter);

    function getByHash(bytes32 hash) external view returns(PermissionLib.PermissionFull memory data);

    function get(PermissionLib.PermissionIdentifier calldata identifier) external view returns(PermissionLib.PermissionFull memory data);
}
