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

    function getPermissionKeys(FileTypeLib.FileType memory oldfile, FileTypeLib.FileType memory newfile) pure public returns (bytes32[] memory dataHashes) {
        if (oldfile.parentKey != newfile.parentKey) {
            dataHashes[dataHashes.length] = oldfile.parentKey;
            dataHashes[dataHashes.length] = newfile.parentKey;
        }
        // Removing files does not require permission
        // Adding files does require permission
        uint256 length = newfile.filesPerFolder.length;
        for (uint256 i = 0; i < length; i++) {
            dataHashes[dataHashes.length] = newfile.filesPerFolder[i];
        }
    }
}
