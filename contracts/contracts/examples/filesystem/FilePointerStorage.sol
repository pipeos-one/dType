pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import './SwarmPointerLib.sol';
import './IpfsPointerLib.sol';
import './UriPointerLib.sol';
import './FilePointerLib.sol';

contract FilePointerStorage {
    using FilePointerLib for FilePointerLib.FilePointer;
    using FilePointerLib for FilePointerLib.FilePointerRequired;

    bytes32[] public typeIndex;
    mapping(bytes32 => Type) public typeStruct;

    // Used for folders, to keep references to their files
    mapping(bytes32 => SwarmPointerLib.SwarmPointer) public swarm;
    mapping(bytes32 => IpfsPointerLib.IpfsPointer) public ipfs;
    mapping(bytes32 => UriPointerLib.UriPointer) public uri;

    struct Type {
        FilePointerLib.FilePointerRequired data;
        uint256 index;
    }

    modifier dataIsStored (bytes32 hash) {
        require(isStored(hash), "No such data inserted.");
        _;
    }

    event LogNew(bytes32 indexed hash, uint256 indexed index);
    event LogUpdate(bytes32 indexed hash, uint256 indexed index);
    event LogRemove(bytes32 indexed hash, uint256 indexed index);

    function insert(FilePointerLib.FilePointer memory data) public returns (bytes32 hasho) {

        // for data integrity
        bytes32 hash = data.getDataHash();

        if(isStored(hash)) revert("This data exists. Use the extant data.");

        typeStruct[hash].data.insert(data);
        typeStruct[hash].index = typeIndex.push(hash) - 1;

        swarm[hash] = data.swarm;
        ipfs[hash] = data.ipfs;
        uri[hash] = data.uri;

        emit LogNew(hash, typeStruct[hash].index);
        return hash;
    }

    function insertBytes(bytes memory data) public returns (bytes32 hasho) {
        return insert(FilePointerLib.structureBytes(data));
    }

    function remove(bytes32 hash) public returns(uint256 index) {
        if(!isStored(hash)) revert("Not deleted: not extant.");
        uint rowToDelete = typeStruct[hash].index;
        bytes32 keyToMove = typeIndex[typeIndex.length-1];
        typeIndex[rowToDelete] = keyToMove;
        typeStruct[keyToMove].index = rowToDelete;
        typeIndex.length--;

        delete swarm[hash];
        delete ipfs[hash];
        delete uri[hash];

        emit LogRemove(hash, rowToDelete);

        emit LogUpdate(keyToMove, rowToDelete);
        return rowToDelete;
    }

    function update(bytes32 hashi, FilePointerLib.FilePointer memory data)
        public
        returns(bytes32 hash)
    {
        remove(hashi);
        return insert(data);
    }

    function isStored(bytes32 hash) public view returns(bool isIndeed) {
        if(typeIndex.length == 0) return false;
        return (typeIndex[typeStruct[hash].index] == hash);
    }

    function getByHash(bytes32 hash) public view returns(FilePointerLib.FilePointer memory data) {
        if(!isStored(hash)) revert("No such data inserted.");
        return typeStruct[hash].data.getFull(swarm[hash], ipfs[hash], uri[hash]);
    }

    function count() public view returns(uint256 counter) {
        return typeIndex.length;
    }
}
