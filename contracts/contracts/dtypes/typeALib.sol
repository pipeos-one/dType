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

    function destructureBytes(TypeA memory typeA)
        pure
        internal
        returns(bytes memory data)
    {
        return abi.encode(typeA);
    }

    function map(
        address callbackAddr,
        bytes4 callbackSig,
        TypeA[] memory typeAarr
    )
        view
        internal
        returns (TypeA[] memory result)
    {
        uint length = typeAarr.length;
        result = new TypeA[](length);

        for (uint i = 0; i < length; i++) {
            (bool success, bytes memory data) = callbackAddr.staticcall(abi.encodeWithSelector(callbackSig, typeAarr[i]));

            require(success, "Map callback failed");
            result[i] = structureBytes(data);
        }

        return result;
    }
}
