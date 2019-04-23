pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

library VoteParametersLib {
    struct VoteParameters {
        uint256 importance;
        uint256 cutoff;
        uint256 golive;
        // if voting is continous, godead == 0
        uint256 godead;
    }
}
