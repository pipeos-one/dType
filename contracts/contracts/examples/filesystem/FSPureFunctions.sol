pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import './FileTypeLib.sol';

contract FSPureFunctions {
    using FileTypeLib for FileTypeLib.FileType;

    function structureData(bytes memory oldrawfile, bytes memory newrawfile) pure public returns(FileTypeLib.FileType memory oldfile, FileTypeLib.FileType memory newfile) {
        return (
            FileTypeLib.structureBytes(oldrawfile),
            FileTypeLib.structureBytes(newrawfile)
        );
    }

    function changeFileName(FileTypeLib.FileType memory oldfile, FileTypeLib.FileType memory newfile)
        pure
        public
        returns (FileTypeLib.FileType memory changedFile, FileTypeLib.FileType memory inewfile)
    {
        oldfile.pointer.name = newfile.pointer.name;
        return (oldfile, newfile);
    }

    function changeFileParent(FileTypeLib.FileType memory oldfile, FileTypeLib.FileType memory newfile)
        pure
        public
        returns (FileTypeLib.FileType memory changedFile, FileTypeLib.FileType memory inewfile)
    {
        oldfile.parentKey = newfile.parentKey;
        return (oldfile, newfile);
    }

    function addFolderFile(FileTypeLib.FileType memory oldfile, FileTypeLib.FileType memory newfile)
        pure
        public
        returns (FileTypeLib.FileType memory changedFile, FileTypeLib.FileType memory inewfile)
    {
        require(newfile.filesPerFolder.length == 1);
        oldfile.filesPerFolder[oldfile.filesPerFolder.length] = newfile.filesPerFolder[1];
        return (oldfile, newfile);
    }

    function removeFolderFile(FileTypeLib.FileType memory oldfile, FileTypeLib.FileType memory newfile)
        pure
        public
        returns (FileTypeLib.FileType memory changedFile, FileTypeLib.FileType memory inewfile)
    {
        require(newfile.filesPerFolder.length == 1);
        uint256 length = oldfile.filesPerFolder.length;
        for (uint256 i = 0; i < length; i++) {
            if (oldfile.filesPerFolder[i] == newfile.filesPerFolder[1]) {
                oldfile.filesPerFolder[i] = oldfile.filesPerFolder[length - 1];
                delete oldfile.filesPerFolder[oldfile.filesPerFolder.length];
            }
        }
        return (oldfile, newfile);
    }

    function changeFolderFiles(FileTypeLib.FileType memory oldfile, FileTypeLib.FileType memory newfile)
        pure
        public
        returns (FileTypeLib.FileType memory changedFile, FileTypeLib.FileType memory inewfile)
    {
        oldfile.filesPerFolder = newfile.filesPerFolder;
        return (oldfile, newfile);
    }

    function getChangedFile(FileTypeLib.FileType memory oldfile, FileTypeLib.FileType memory newfile)
        pure
        public
        returns (FileTypeLib.FileType memory changedFile)
    {
        return oldfile;
    }

    // TODO: we need both old file and new file for parentKey
    // or attach another permission to a dataHash, related to the parentKey & other keys
    function getUpdatePermissionKeys(FileTypeLib.FileType memory file)
        pure
        public
        returns (bytes32[] memory dataHashes)
    {
        uint256 length = file.filesPerFolder.length;
        dataHashes = new bytes32[](length + 1);

        dataHashes[0] = file.parentKey;

        // Removing files does not require permission
        // Adding files does require permission
        for (uint256 i = 0; i < length; i++) {
            dataHashes[i + 1] = file.filesPerFolder[i];
        }
    }

    function getInsertPermissionKeys(FileTypeLib.FileType memory file)
        pure
        public
        returns (bytes32[] memory dataHashes)
    {
        uint256 length = file.filesPerFolder.length;
        dataHashes = new bytes32[](length + 1);

        dataHashes[0] = file.parentKey;

        // Removing files does not require permission
        // Adding files does require permission
        for (uint256 i = 0; i < length; i++) {
            dataHashes[i + 1] = file.filesPerFolder[i];
        }
    }
}
