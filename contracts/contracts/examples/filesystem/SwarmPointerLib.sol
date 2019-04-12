pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

library SwarmPointerLib {

    enum Protocol {
        BZZ,
        BZZRAW
    }

    struct SwarmPointer {
        Protocol protocol;
        bytes32 filehash;
    }

    function insert(SwarmPointer storage self, SwarmPointer memory pointer) internal {
        if (pointer.filehash != bytes32(0x0)) {
            self.protocol = pointer.protocol;
            self.filehash = pointer.filehash;
        }
    }

    function insertArray(SwarmPointer[] storage self, SwarmPointer[] memory pointer) internal {
        uint256 length = pointer.length;
        for (uint256 i = 0; i < length; i++) {
            insert(self[i], pointer[i]);
        }
    }

    function getDataHash(SwarmPointer memory pointer) pure public returns(bytes32 hash) {
        return keccak256(abi.encode(pointer));
    }

    function getRequired(SwarmPointer memory pointer) pure public returns(SwarmPointer memory pointerRequired) {
        return pointer;
    }

    function getFull(SwarmPointer memory pointer) pure public returns(SwarmPointer memory pointerFull) {
        return pointer;
    }

    function structureBytes(bytes memory data)
        pure
        public
        returns(SwarmPointer memory pointer)
    {
        (pointer) = abi.decode(data, (SwarmPointer));
    }

    function destructureBytes(SwarmPointer memory pointer)
        pure
        public
        returns(bytes memory data)
    {
        return abi.encode(pointer);
    }

    function map(
        address callbackAddr,
        bytes4 callbackSig,
        SwarmPointer[] memory pointerArr
    )
        view
        public
        returns (SwarmPointer[] memory result)
    {
        uint length = pointerArr.length;
        result = new SwarmPointer[](length);

        for (uint i = 0; i < length; i++) {
            (bool success, bytes memory data) = callbackAddr.staticcall(abi.encodeWithSelector(callbackSig, pointerArr[i]));

            require(success, "Map callback failed");
            result[i] = structureBytes(data);
        }

        return result;
    }
}
