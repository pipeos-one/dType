pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

library VoteParametersLib {
    struct VoteParameters {
        // (1,3]
        uint256 importance;
        // (importance * 2), 64]
        uint256 cutoff;
        // [100, 50%*total]
        uint256 golive;
        // if voting is continous, godead == 0
        // [golive*2, total]
        uint256 godead;
    }
}
