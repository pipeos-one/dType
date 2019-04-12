pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import './FileTypeLib.sol';

contract FSPureFunctions {
    using FileTypeLib for FileTypeLib.FileType;

    function changeName(FileTypeLib.FileType memory file)
        pure
        public
        returns (FileTypeLib.FileType memory changedFile)
    {
        file.pointer.name = string(abi.encodePacked(file.pointer.name, "1"));
        return file;
    }
}
