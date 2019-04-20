pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

library VoteResourceTypeLib {

    struct VoteResource {
        address contractAddress;
        // can be bytes if data is not inserted
        bytes32 dataHash;
        uint256 score;
        mapping(address => bool) voted;
    }

    function insert(FilePointerRequired storage self, FilePointer memory pointer) internal {
        self.name = pointer.name;
        self.extension = pointer.extension;
    }

    function insertArray(FilePointerRequired[] storage self, FilePointer[] memory pointers) internal {
        uint256 length = pointers.length;
        for (uint256 i = 0; i < length; i++) {
            insert(self[i], pointers[i]);
        }
    }

    function getDataHash(FilePointer memory pointer) pure public returns(bytes32 hash) {
        return keccak256(abi.encode(pointer));
    }

    function getFull(
        FilePointerRequired memory pointer,
        SwarmPointerLib.SwarmPointer memory swarm,
        IpfsPointerLib.IpfsPointer memory ipfs,
        UriPointerLib.UriPointer memory uri
    )
        pure
        public
        returns(FilePointer memory pointerFull)
    {
        return FilePointer(pointer.name, pointer.extension, swarm, ipfs, uri);
    }

    function structureBytes(bytes memory data)
        pure
        public
        returns(FilePointer memory pointer)
    {
        (pointer) = abi.decode(data, (FilePointer));
    }

    function destructureBytes(FilePointer memory pointer)
        pure
        public
        returns(bytes memory data)
    {
        return abi.encode(pointer);
    }

    function map(
        address callbackAddr,
        bytes4 callbackSig,
        FilePointer[] memory pointerArr
    )
        view
        public
        returns (FilePointer[] memory result)
    {
        uint length = pointerArr.length;
        result = new FilePointer[](length);

        for (uint i = 0; i < length; i++) {
            (bool success, bytes memory data) = callbackAddr.staticcall(abi.encodeWithSelector(callbackSig, pointerArr[i]));

            require(success, "Map callback failed");
            result[i] = structureBytes(data);
        }

        return result;
    }
}
