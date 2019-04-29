pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import './PermissionFunctionLib.sol';

interface PermissionFunctionInterface {
    function insert(PermissionFunctionLib.PermissionFunction calldata data) external returns (bytes32 hasho);

    function update(bytes32 hashi, PermissionFunctionLib.PermissionFunction calldata data) external returns(bytes32 hash);

    function remove(bytes32 hash) external returns(uint256 index);

    function count() external view returns(uint256 counter);

    function getByHash(bytes32 hash) external view returns(PermissionFunctionLib.PermissionFunctionRequired memory data);

    function get(address contractAddress, bytes4 functionSig) external view returns(PermissionFunctionLib.PermissionFunctionRequired memory data);
}
