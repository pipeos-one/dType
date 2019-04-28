pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import './VoteTypeLib.sol';
import './VoteResourceTypeLib.sol';

interface VoteResourceInterface {
    event LogNew(bytes32 indexed hash, uint256 indexed index);
    event LogUpdate(bytes32 indexed hash, uint256 indexed index);
    event LogRemove(bytes32 indexed hash, uint256 indexed index);

    function insert(VoteResourceTypeLib.VoteResource calldata data) external returns (bytes32 hasho);

    function update(bytes32 hashi, VoteTypeLib.UserVote calldata vote) external;

    function remove(bytes32 hash) external returns(uint256 index);

    function count() external view returns(uint256 counter);

    function getByHash(bytes32 hash) external view returns(VoteResourceTypeLib.VoteResource memory data);
}
