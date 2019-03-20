pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

library typeBLib {

    struct TypeB {
        uint256 staked;
    }

    function structure(uint256 staked)
        pure
        internal
        returns(TypeB memory typeB)
    {
        return TypeB(staked);
    }

    function destructure(TypeB memory typeB)
        pure
        internal
        returns (uint256 staked)
    {
        return (typeB.staked);
    }

    function structureBytes(bytes memory data)
        pure
        internal
        returns(TypeB memory typeB)
    {
        (typeB) = abi.decode(data, (TypeB));
    }
}
