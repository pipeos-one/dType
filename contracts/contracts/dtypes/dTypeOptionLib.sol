pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

library dTypeOptionLib {

    struct TypeOption {
        uint256 id;
        string name;
    }

    function structure(uint256 id, string memory name)
        pure
        internal
        returns(TypeOption memory option)
    {
        return TypeOption(id, name);
    }

    function destructure(TypeOption memory option)
        pure
        internal
        returns (uint256 id, string memory name)
    {
        return (option.id, option.name);
    }

    function structureBytes(bytes memory data)
        pure
        internal
        returns(TypeOption memory option)
    {
        (option) = abi.decode(data, (TypeOption));
    }

    function destructureBytes(TypeOption memory option)
        pure
        internal
        returns(bytes memory data)
    {
        return abi.encode(option);
    }

    function map(
        address callbackAddr,
        bytes4 callbackSig,
        TypeOption[] memory optionAarr
    )
        view
        internal
        returns (TypeOption[] memory result)
    {
        uint length = optionAarr.length;
        result = new TypeOption[](length);

        for (uint i = 0; i < length; i++) {
            (bool success, bytes memory data) = callbackAddr.staticcall(abi.encodeWithSelector(callbackSig, optionAarr[i]));

            require(success, "Map callback failed");
            result[i] = structureBytes(data);
        }

        return result;
    }
}
