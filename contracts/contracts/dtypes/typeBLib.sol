pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import './typeALib.sol';

library typeBLib {
    using typeALib for typeALib.TypeA;

    struct TypeB {
        uint256 staked;
        typeALib.TypeA typeA;
    }

    function structure(uint256 staked, typeALib.TypeA memory typeA)
        pure
        internal
        returns(TypeB memory typeB)
    {
        return TypeB(staked, typeA);
    }

    function destructure(TypeB memory typeB)
        pure
        internal
        returns (uint256 staked, typeALib.TypeA memory typeA)
    {
        return (typeB.staked, typeB.typeA);
    }

    function structureBytes(bytes memory data)
        pure
        internal
        returns(TypeB memory typeB)
    {
        (typeB) = abi.decode(data, (TypeB));
    }

    function destructureBytes(TypeB memory typeB)
        pure
        internal
        returns(bytes memory data)
    {
        return abi.encode(typeB);
    }

    function map(
        address callbackAddr,
        bytes4 callbackSig,
        TypeB[] memory typeAarr
    )
        view
        internal
        returns (TypeB[] memory result)
    {
        uint length = typeAarr.length;
        result = new TypeB[](length);

        for (uint i = 0; i < length; i++) {
            (bool success, bytes memory data) = callbackAddr.staticcall(abi.encodeWithSelector(callbackSig, typeAarr[i]));

            require(success, "Map callback failed");
            result[i] = structureBytes(data);
        }

        return result;
    }
}
