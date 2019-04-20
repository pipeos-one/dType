pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

library VoteTypeLib {

    struct Vote {
        address senderAddress;
        bool vote;
    }
}
