pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import './FileTypeLib.sol';
import '../../StorageBase.sol';

contract FileTypeStorage is StorageBase {
    using FileTypeLib for FileTypeLib.FileType;
    using FileTypeLib for FileTypeLib.FileTypeRequired;

    mapping(bytes32 => Type) public typeStruct;

    // Used for folders, to keep references to their files
    mapping(bytes32 => bytes32[]) public filesPerFolder;

    mapping(bytes32 => mapping(address => FileTypeLib.FileType)) public inreview;

    struct Type {
        FileTypeLib.FileTypeRequired data;
        uint256 index;
    }

    modifier dataIsStored (bytes32 hash) {
        require(isStored(hash), "No such data inserted.");
        _;
    }

    function insert(FileTypeLib.FileType memory data) public returns (bytes32 hash) {
        hash = data.getDataHash();

        insertPrivate(hash, data);
    }

    function insertReview(address proponent, bytes memory rawdata) public returns (bytes32 hash) {
        FileTypeLib.FileType memory data = FileTypeLib.structureBytes(rawdata);
        hash = data.getDataHash();
        inreview[hash][proponent] = data;
        emit LogNewReview(hash, proponent);
    }

    function addFile(bytes32 typeHash, bytes32 fileHash)
        dataIsStored(typeHash)
        public
    {
        require(
            isStored(fileHash),
            'A file in the composition does not exists'
        );
        filesPerFolder[typeHash].push(fileHash);
    }

    function setFiles(bytes32 typeHash, bytes32[] memory fileRefs) public {
        for (uint256 i = 0 ; i < fileRefs.length; i++) {
            addFile(typeHash, fileRefs[i]);
        }
    }

    function insertBytes(bytes memory data) public returns (bytes32 hasho) {
        return insert(FileTypeLib.structureBytes(data));
    }

    function remove(bytes32 hash) public returns(uint256 index) {
        if(!isStored(hash)) revert("Not deleted: not extant.");

        uint rowToDelete = typeStruct[hash].index;
        bytes32 keyToMove = typeIndex[typeIndex.length-1];
        typeIndex[rowToDelete] = keyToMove;
        typeStruct[keyToMove].index = rowToDelete;
        typeIndex.length--;

        delete typeStruct[hash];

        emit LogRemove(hash, rowToDelete);
        emit LogUpdate(keyToMove, rowToDelete);

        return rowToDelete;
    }

    function removeReview(address proponent, bytes32 hash) public {
        require(isStored(hash), 'Not extant');

        // In case there was a previous propoal
        delete inreview[hash][proponent];
        emit LogRemoveReview(hash, proponent);
    }

    function update(bytes32 hashi, FileTypeLib.FileType memory data)
        public
        returns(bytes32 hash)
    {
        remove(hashi);
        return insert(data);
    }

    function updateReview(address proponent, bytes memory rawdata)
        public
    {
        FileTypeLib.FileType memory data = FileTypeLib.structureBytes(rawdata);
        bytes32 hash = data.getDataHash();
        inreview[hash][proponent] = data;
        emit LogUpdateReview(hash, proponent);
    }

    function accept(address proponent, bytes32 hash) public {
        if (!isStored(hash)) {
            FileTypeLib.FileType memory file = inreview[hash][proponent];
            insertPrivate(hash, file);
        } else {
            typeStruct[hash].data.insert(inreview[hash][proponent]);
        }
        delete inreview[hash][proponent];
        emit LogAccepted(hash, proponent);
    }

    function dismiss(address proponent, bytes32 hash) public {
        inreview[hash][proponent] = getByHash(hash);
        remove(hash);
        emit LogDismissed(hash, proponent);
    }

    function isStored(bytes32 hash) public view returns(bool isIndeed) {
        if(typeIndex.length == 0) return false;
        return (typeIndex[typeStruct[hash].index] == hash);
    }

    function getByHash(bytes32 hash) public view returns(FileTypeLib.FileType memory data) {
        return typeStruct[hash].data.getFull(getFiles(hash));
    }

    function getFiles(bytes32 typeHash) view public returns (bytes32[] memory fileRefs) {
        return filesPerFolder[typeHash];
    }

    function insertPrivate(bytes32 hash, FileTypeLib.FileType memory data) private {
        if(isStored(hash)) revert("This data exists. Use the extant data.");

        typeStruct[hash].data.insert(data);
        typeStruct[hash].index = typeIndex.push(hash) - 1;

        setFiles(hash, data.filesPerFolder);

        emit LogNew(hash, typeStruct[hash].index);
    }
}
