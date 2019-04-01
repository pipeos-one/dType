pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import './dTypeOptionLib.sol';

library dTypeOptionStakedLib {
    using dTypeOptionLib for dTypeOptionLib.TypeOption;

    struct TypeOptionStaked {
        uint256 staked;
        dTypeOptionLib.TypeOption option;
    }

    function structure(uint256 staked, dTypeOptionLib.TypeOption memory option)
        pure
        internal
        returns(TypeOptionStaked memory stakedOption)
    {
        return TypeOptionStaked(staked, option);
    }

    function destructure(TypeOptionStaked memory stakedOption)
        pure
        internal
        returns (uint256 staked, dTypeOptionLib.TypeOption memory option)
    {
        return (stakedOption.staked, stakedOption.option);
    }

    function structureBytes(bytes memory data)
        pure
        internal
        returns(TypeOptionStaked memory stakedOption)
    {
        (stakedOption) = abi.decode(data, (TypeOptionStaked));
    }

    function destructureBytes(TypeOptionStaked memory stakedOption)
        pure
        internal
        returns(bytes memory data)
    {
        return abi.encode(stakedOption);
    }

    function map(
        address callbackAddr,
        bytes4 callbackSig,
        TypeOptionStaked[] memory optionAarr
    )
        view
        internal
        returns (TypeOptionStaked[] memory result)
    {
        uint length = optionAarr.length;
        result = new TypeOptionStaked[](length);

        for (uint i = 0; i < length; i++) {
            (bool success, bytes memory data) = callbackAddr.staticcall(abi.encodeWithSelector(callbackSig, optionAarr[i]));

            require(success, "Map callback failed");
            result[i] = structureBytes(data);
        }

        return result;
    }
}
