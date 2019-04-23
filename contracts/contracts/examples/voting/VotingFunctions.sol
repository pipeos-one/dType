pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import './VoteTypeLib.sol';
import './VoteResourceTypeLib.sol';
import './VotingMechanismTypeLib.sol';

contract VotingFunctions {
    using VoteTypeLib for VoteTypeLib.UserVote;
    using VoteResourceTypeLib for VoteResourceTypeLib.VoteResource;
    using VotingMechanismTypeLib for VotingMechanismTypeLib.VotingMechanismUser;

    function setWeight(VoteTypeLib.UserVote memory vote) public pure returns(uint256) {
        vote.voteWeight = 1;
    }

    // function vote()
}
