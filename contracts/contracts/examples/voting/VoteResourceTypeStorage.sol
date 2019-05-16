pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import './VoteResourceInterface.sol';

contract VoteResourceTypeStorage is VoteResourceInterface {
    using VoteTypeLib for VoteTypeLib.UserVote;
    using VoteResourceTypeLib for VoteResourceTypeLib.VoteResource;
    using VoteResourceTypeLib for VoteResourceTypeLib.VoteResourceIdentifier;

    bytes32[] public typeIndex;
    mapping(bytes32 => Type) public typeStruct;

    struct Type {
        VoteResourceTypeLib.VoteResource data;
        uint256 index;
        mapping(address => bool) voted;
    }

    modifier dataIsStored (bytes32 hash) {
        require(isStored(hash), "No such data inserted.");
        _;
    }

    event LogNew(bytes32 indexed hash, uint256 indexed index);
    event LogUpdate(bytes32 indexed hash, uint256 indexed index);
    event LogRemove(bytes32 indexed hash, uint256 indexed index);

    function insert(VoteResourceTypeLib.VoteResource memory data) public returns (bytes32 hasho) {

        // for data integrity
        bytes32 hash = data.getDataHash();

        if(isStored(hash)) revert("This data exists. Use the extant data.");

        typeStruct[hash].data.insert(data);
        typeStruct[hash].index = typeIndex.push(hash) - 1;

        emit LogNew(hash, typeStruct[hash].index);
        return hash;
    }

    function insertBytes(bytes memory data) public returns (bytes32 hasho) {
        return insert(VoteResourceTypeLib.structureBytes(data));
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

    function update(bytes32 hash, VoteTypeLib.UserVote memory vote)
        public
    {
        require(vote.voteWeight > 0, 'voteWeight must be > 0');
        require(vote.senderAddress != address(0), 'senderAddress null');
        require(typeStruct[hash].voted[vote.senderAddress] == false, 'Already voted');
        typeStruct[hash].voted[vote.senderAddress] = true;
        if (vote.vote == true) {
            typeStruct[hash].data.scoreyes += vote.voteWeight;
        } else {
            typeStruct[hash].data.scoreno += vote.voteWeight;
        }
        emit LogUpdate(hash, typeStruct[hash].index);
    }

    function isStored(bytes32 hash) public view returns(bool isIndeed) {
        if(typeIndex.length == 0) return false;
        return (typeIndex[typeStruct[hash].index] == hash);
    }

    function getByHash(bytes32 hash) public view returns(VoteResourceTypeLib.VoteResource memory data) {
        if(!isStored(hash)) revert("No such data inserted.");
        return typeStruct[hash].data;
    }

    function getHash(VoteResourceTypeLib.VoteResourceIdentifier memory identifier) public view returns(bytes32 hash) {
        return identifier.getDataHash();
    }

    function count() public view returns(uint256 counter) {
        return typeIndex.length;
    }
}
