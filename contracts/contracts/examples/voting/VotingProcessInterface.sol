pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import './VotingProcessLib.sol';

interface VotingProcessInterface {
    event LogNew(bytes32 indexed hash, uint256 indexed index);
    event LogUpdate(bytes32 indexed hash, uint256 indexed index);
    event LogRemove(bytes32 indexed hash, uint256 indexed index);

    function insert(VotingProcessLib.VotingProcess calldata data) external returns (bytes32 hasho);

    function update(bytes32 hashi, VotingProcessLib.VotingProcess calldata vote) external returns(bytes32 hash);

    function remove(bytes32 hash) external returns(uint256 index);

    function count() external view returns(uint256 counter);

    function getByHash(bytes32 hash) external view returns(VotingProcessLib.VotingProcessRequired memory data);
}
