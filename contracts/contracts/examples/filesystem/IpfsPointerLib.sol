pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

library IpfsPointerLib {

    enum Protocol {
        IPFS
    }

    struct IpfsPointer {
        Protocol protocol;
        bytes32 filehash;
    }

    function insert(IpfsPointer storage self, IpfsPointer memory pointer) internal {
        if (pointer.filehash != bytes32(0x0)) {
            self.protocol = pointer.protocol;
            self.filehash = pointer.filehash;
        }
    }

    function insertArray(IpfsPointer[] storage self, IpfsPointer[] memory pointer) internal {
        uint256 length = pointer.length;
        for (uint256 i = 0; i < length; i++) {
            insert(self[i], pointer[i]);
        }
    }

    function getDataHash(IpfsPointer memory pointer) pure public returns(bytes32 hash) {
        return keccak256(abi.encode(pointer));
    }

    function getRequired(IpfsPointer memory pointer) pure public returns(IpfsPointer memory pointerRequired) {
        return pointer;
    }

    function getFull(IpfsPointer memory pointer) pure public returns(IpfsPointer memory pointerFull) {
        return pointer;
    }

    function structureBytes(bytes memory data)
        pure
        public
        returns(IpfsPointer memory pointer)
    {
        (pointer) = abi.decode(data, (IpfsPointer));
    }

    function destructureBytes(IpfsPointer memory pointer)
        pure
        public
        returns(bytes memory data)
    {
        return abi.encode(pointer);
    }

    function map(
        address callbackAddr,
        bytes4 callbackSig,
        IpfsPointer[] memory pointerArr
    )
        view
        public
        returns (IpfsPointer[] memory result)
    {
        uint length = pointerArr.length;
        result = new IpfsPointer[](length);

        for (uint i = 0; i < length; i++) {
            (bool success, bytes memory data) = callbackAddr.staticcall(abi.encodeWithSelector(callbackSig, pointerArr[i]));

            require(success, "Map callback failed");
            result[i] = structureBytes(data);
        }

        return result;
    }
}
