pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import './VotingProcessInterface.sol';
import './VotingProcessLib.sol';

contract VotingProcessStorage is VotingProcessInterface {
    using VotingProcessLib for VotingProcessLib.VotingProcessRequired;
    using VotingProcessLib for VotingProcessLib.VotingProcess;

    bytes32[] public typeIndex;
    mapping(bytes32 => Type) public typeStruct;

    // keccak256(address, function hash to be called)
    mapping(bytes32 => bytes32) mechanismMap;

    struct Type {
        VotingProcessLib.VotingProcessRequired data;
        uint256 index;
    }

    modifier dataIsStored (bytes32 hash) {
        require(isStored(hash), "No such data inserted.");
        _;
    }

    event LogNew(bytes32 indexed hash, uint256 indexed index);
    event LogUpdate(bytes32 indexed hash, uint256 indexed index);
    event LogRemove(bytes32 indexed hash, uint256 indexed index);

    function insert(VotingProcessLib.VotingProcess memory data) public returns (bytes32 hasho) {

        // for data integrity
        bytes32 hash = data.getDataHash();

        if(isStored(hash)) revert("This data exists. Use the extant data.");

        typeStruct[hash].data.insert(data);
        typeStruct[hash].index = typeIndex.push(hash) - 1;

        emit LogNew(hash, typeStruct[hash].index);
        return hash;
    }

    function insertBytes(bytes memory data) public returns (bytes32 hasho) {
        return insert(VotingProcessLib.structureBytes(data));
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

    function update(bytes32 hashi, VotingProcessLib.VotingProcess memory data)
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

    function getByHash(bytes32 hash) public view returns(VotingProcessLib.VotingProcessRequired memory data) {
        if(!isStored(hash)) revert("No such data inserted.");
        return typeStruct[hash].data;
    }

    function count() public view returns(uint256 counter) {
        return typeIndex.length;
    }
}
