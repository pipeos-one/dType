pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

library typeALib {

    struct TypeA {
        uint256 balance;
    }

    function structure(uint256 balance)
        pure
        internal
        returns(TypeA memory typeA)
    {
        return TypeA(balance);
    }

    function destructure(TypeA memory typeA)
        pure
        internal
        returns (uint256 balance)
    {
        return (typeA.balance);
    }


}
