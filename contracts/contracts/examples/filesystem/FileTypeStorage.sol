pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import './FSBaseTypeLib.sol';

contract FileTypeStorage {
    using FSBaseTypeLib for FSBaseTypeLib.FSBaseType;

    bytes32[] public typeIndex;
    mapping(bytes32 => Type) public typeStruct;

    struct Type {
        FSBaseTypeLib.FSBaseType data;
        uint256 index;
    }

    modifier dataIsStored (bytes32 hash) {
        require(isStored(hash), "No such data inserted.");
        _;
    }

    event LogNew(bytes32 indexed hash, uint256 indexed index);
    event LogUpdate(bytes32 indexed hash, uint256 indexed index);
    event LogRemove(bytes32 indexed hash, uint256 indexed index);

    function insert(FSBaseTypeLib.FSBaseType memory data) public returns (bytes32 hasho) {

        // for data integrity
        bytes32 hash = keccak256(abi.encode(data));

        if(isStored(hash)) revert("This data exists. Use the extant data.");

        typeStruct[hash].data = data;
        typeStruct[hash].index = typeIndex.push(hash) - 1;
        emit LogNew(hash, typeStruct[hash].index);
        return hash;
    }

    function insertBytes(bytes memory data) public returns (bytes32 hasho) {
        return insert(FSBaseTypeLib.structureBytes(data));
    }

    function remove(bytes32 hash) public returns(uint256 index) {
        if(!isStored(hash)) revert("Not deleted: not extant.");
        uint rowToDelete = typeStruct[hash].index;
        bytes32 keyToMove = typeIndex[typeIndex.length-1];
        typeIndex[rowToDelete] = keyToMove;
        typeStruct[keyToMove].index = rowToDelete;
        typeIndex.length--;
        emit LogRemove(hash, rowToDelete);

        emit LogUpdate(keyToMove, rowToDelete);
        return rowToDelete;
    }

    function update(bytes32 hashi, FSBaseTypeLib.FSBaseType memory data)
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

    function getByHash(bytes32 hash) public view returns(FSBaseTypeLib.FSBaseType memory data) {
        if(!isStored(hash)) revert("No such data inserted.");
        return(typeStruct[hash].data);
    }

    function count() public view returns(uint256 counter) {
        return typeIndex.length;
    }
}
