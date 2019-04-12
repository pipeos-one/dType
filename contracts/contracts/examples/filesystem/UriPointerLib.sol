pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

library UriPointerLib {

    struct UriPointer {
        string uri;
    }

    function insert(UriPointer storage self, UriPointer memory pointer) internal {
        if (keccak256(abi.encodePacked(pointer.uri)) != keccak256(abi.encodePacked(""))) {
            self.uri = pointer.uri;
        }
    }

    function insertArray(UriPointer[] storage self, UriPointer[] memory pointer) internal {
        uint256 length = pointer.length;
        for (uint256 i = 0; i < length; i++) {
            insert(self[i], pointer[i]);
        }
    }

    function getDataHash(UriPointer memory pointer) pure public returns(bytes32 hash) {
        return keccak256(abi.encode(pointer));
    }

    function getRequired(UriPointer memory pointer) pure public returns(UriPointer memory pointerRequired) {
        return pointer;
    }

    function getFull(UriPointer memory pointer) pure public returns(UriPointer memory pointerFull) {
        return pointer;
    }

    function structureBytes(bytes memory data)
        pure
        public
        returns(UriPointer memory pointer)
    {
        (pointer) = abi.decode(data, (UriPointer));
    }

    function destructureBytes(UriPointer memory pointer)
        pure
        public
        returns(bytes memory data)
    {
        return abi.encode(pointer);
    }

    function map(
        address callbackAddr,
        bytes4 callbackSig,
        UriPointer[] memory pointerArr
    )
        view
        public
        returns (UriPointer[] memory result)
    {
        uint length = pointerArr.length;
        result = new UriPointer[](length);

        for (uint i = 0; i < length; i++) {
            (bool success, bytes memory data) = callbackAddr.staticcall(abi.encodeWithSelector(callbackSig, pointerArr[i]));

            require(success, "Map callback failed");
            result[i] = structureBytes(data);
        }

        return result;
    }
}
