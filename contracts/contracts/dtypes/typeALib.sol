pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

library typeALib {

    struct TypeA {
        uint256 balance;
        address token;
    }

    function structure(uint256 balance, address token)
        pure
        internal
        returns(TypeA memory typeA)
    {
        return TypeA(balance, token);
    }

    function destructure(TypeA memory typeA)
        pure
        internal
        returns (uint256 balance, address token)
    {
        return (typeA.balance, typeA.token);
    }

    function structureBytes(bytes memory data)
        pure
        internal
        returns(TypeA memory typeA)
    {
        (typeA) = abi.decode(data, (TypeA));
    }
}
