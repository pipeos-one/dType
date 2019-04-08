pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

// import './ExtensionLib.sol';

library FileTypeLib {

    struct FileType {
        string name;
        // ExtensionLib.Extension extension;
        uint8 extension;
        string source;  // swarm/ipfs url; will be a type in itself
        bytes32 parentKey;  // string path
    }

    function getDataHash(FileType memory fsbase) pure public returns(bytes32 hash) {
        return keccak256(abi.encode(fsbase));
    }

    function structureBytes(bytes memory data)
        pure
        public
        returns(FileType memory fsbase)
    {
        (fsbase) = abi.decode(data, (FileType));
    }

    function destructureBytes(FileType memory fsbase)
        pure
        public
        returns(bytes memory data)
    {
        return abi.encode(fsbase);
    }

    function map(
        address callbackAddr,
        bytes4 callbackSig,
        FileType[] memory fsbaseAarr
    )
        view
        public
        returns (FileType[] memory result)
    {
        uint length = fsbaseAarr.length;
        result = new FileType[](length);

        for (uint i = 0; i < length; i++) {
            (bool success, bytes memory data) = callbackAddr.staticcall(abi.encodeWithSelector(callbackSig, fsbaseAarr[i]));

            require(success, "Map callback failed");
            result[i] = structureBytes(data);
        }

        return result;
    }
}
