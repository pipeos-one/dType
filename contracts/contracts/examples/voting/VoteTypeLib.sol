pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

library VoteTypeLib {

    struct UserVote {
        bool vote;
        uint256 voteWeight;
        address senderAddress;
    }
}
