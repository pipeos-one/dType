pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import './VoteTypeLib.sol';
import './VoteResourceTypeLib.sol';
import './VoteParametersLib.sol';
import './VoteStateLib.sol';
// import './VotingMechanismTypeLib.sol';

contract VotingFunctions {
    using VoteTypeLib for VoteTypeLib.UserVote;
    using VoteResourceTypeLib for VoteResourceTypeLib.VoteResource;
    // using VotingMechanismTypeLib for VotingMechanismTypeLib.VotingMechanismUser;

    function setWeight(VoteTypeLib.UserVote memory vote)
        public
        pure
        returns(VoteTypeLib.UserVote memory newVote)
    {
        vote.voteWeight = 1;
        return vote;
    }

    function inLivePeriod(VoteStateLib.VoteState memory vote) public pure returns(bool isLive) {
        uint256 votes = vote.resource.scoreyes + vote.resource.scoreno;
        return vote.parameters.golive <= votes && votes < vote.parameters.godead;
    }

    function isInOutcomeArea(uint256 outcomeVotes, uint256 againstOutcomeVotes, VoteParametersLib.VoteParameters memory params) public pure returns(bool outcomeChanged) {
        return (
            params.importance * againstOutcomeVotes <= outcomeVotes &&
            outcomeVotes < params.cutoff * againstOutcomeVotes
        );
    }

    function getInitialScore(VoteStateLib.VoteState memory vote)
        public
        pure
        returns(uint256 scoreyes, uint256 scoreno)
    {
        scoreyes = vote.resource.scoreyes;
        scoreno = vote.resource.scoreno;
        if (vote.vote.vote == true) {
            scoreyes -= vote.vote.voteWeight;
        } else {
            scoreno -= vote.vote.voteWeight;
        }
    }

    function voteTriggeredAction(VoteStateLib.VoteState memory vote)
        public
        pure
        returns(bool triggerAction, uint8 actionType)
    {
        if (!inLivePeriod(vote)) {
            return (false, 0);
        }
        (uint256 oldScoreYes, uint256 oldScoreNo) = getInitialScore(vote);

        bool isOldInNoArea = isInOutcomeArea(oldScoreNo, oldScoreYes, vote.parameters);
        bool isNewInYesActionArea = isInOutcomeArea(
            vote.resource.scoreyes,
            vote.resource.scoreno,
            vote.parameters
        );
        if (isOldInNoArea && isNewInYesActionArea) {
            return (true, 1);
        }

        bool isOldInYesArea = isInOutcomeArea(oldScoreYes, oldScoreNo, vote.parameters);
        bool isNewInNoActionArea = isInOutcomeArea(
            vote.resource.scoreno,
            vote.resource.scoreyes,
            vote.parameters
        );
        if (isOldInYesArea && isNewInNoActionArea) {
            return (true, 0);
        }

        return (false, 0);
    }
}
