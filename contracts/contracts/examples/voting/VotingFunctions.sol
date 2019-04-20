pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import './VoteTypeLib.sol';
import './VotingMechanismTypeLib.sol';

contract VotingFunctions {
    using VoteTypeLib for VoteTypeLib.VoteResource;
    using VotingMechanismTypeLib for VotingMechanismTypeLib.VotingMechanismUser;

    function vote() returns(VoteTypeLib.VoteResource) {
        // replaces sender with delegator
    }
}
