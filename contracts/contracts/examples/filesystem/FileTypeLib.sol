pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

// import './ExtensionLib.sol';

library FileTypeLib {

    struct FileTypeRequired {
        string name;
        // ExtensionLib.Extension extension;
        uint8 extension;
        string source;  // swarm/ipfs url; will be a type in itself
        bytes32 parentKey;  // string path
    }

    struct FileType {
        string name;
        uint8 extension;
        string source;
        bytes32 parentKey;
        bytes32[] filesPerFolder;
    }

    function insert(FileTypeRequired storage self, FileType memory file) internal {
        self.name = file.name;
        self.extension = file.extension;
        self.source = file.source;
        self.parentKey = file.parentKey;
    }

    function insertArray(FileTypeRequired[] storage self, FileType[] memory files) internal {
        uint256 length = files.length;
        for (uint256 i = 0; i < length; i++) {
            insert(self[i], files[i]);
        }
    }

    function getDataHash(FileType memory file) pure public returns(bytes32 hash) {
        return keccak256(abi.encode(file));
    }

    function getRequired(FileType memory fileFull) pure public returns(FileTypeRequired memory file) {
        return FileTypeRequired(
            fileFull.name,
            fileFull.extension,
            fileFull.source,
            fileFull.parentKey
        );
    }

    function getFull(FileTypeRequired memory file, bytes32[] memory filesPerFolder) pure public returns(FileType memory fileFull) {
        return FileType(
            file.name,
            file.extension,
            file.source,
            file.parentKey,
            filesPerFolder
        );
    }

    function structureBytes(bytes memory data)
        pure
        public
        returns(FileType memory file)
    {
        (file) = abi.decode(data, (FileType));
    }

    function destructureBytes(FileType memory file)
        pure
        public
        returns(bytes memory data)
    {
        return abi.encode(file);
    }

    function map(
        address callbackAddr,
        bytes4 callbackSig,
        FileType[] memory fileAarr
    )
        view
        public
        returns (FileType[] memory result)
    {
        uint length = fileAarr.length;
        result = new FileType[](length);

        for (uint i = 0; i < length; i++) {
            (bool success, bytes memory data) = callbackAddr.staticcall(abi.encodeWithSelector(callbackSig, fileAarr[i]));

            require(success, "Map callback failed");
            result[i] = structureBytes(data);
        }

        return result;
    }
}
