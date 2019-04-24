pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import './VoteTypeLib.sol';
import './VoteResourceTypeLib.sol';
import './VoteParametersLib.sol';

library VoteStateLib {

    struct VoteState {
        VoteResourceTypeLib.VoteResource resource;
        VoteTypeLib.UserVote vote;
        VoteParametersLib.VoteParameters parameters;
    }
}

// action type - yes/no -> enable()/disable() something. we may need inputs for enabling/disabling function
