pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import './PermissionTypeLib.sol';

contract PermissionTypeStorage {
    using PermissionTypeLib for PermissionTypeLib.PermissionType;
    using PermissionTypeLib for PermissionTypeLib.PermissionTypeRequired;

    bytes32[] public typeIndex;
    mapping(bytes32 => Type) public typeStruct;

    struct Type {
        PermissionTypeLib.PermissionTypeRequired data;
        uint256 index;
        bool enabled;
    }

    modifier dataIsStored (bytes32 hash) {
        require(isStored(hash), "No such data inserted.");
        _;
    }

    event LogNew(bytes32 indexed hash, uint256 indexed index);
    event LogUpdate(bytes32 indexed hash, uint256 indexed index);
    event LogRemove(bytes32 indexed hash, uint256 indexed index);

    function insert(PermissionTypeLib.PermissionType memory data) public returns (bytes32 hasho) {

        // for data integrity
        bytes32 hash = data.getDataHash();

        if(isStored(hash)) revert("This data exists. Use the extant data.");

        typeStruct[hash].data.insert(data);
        typeStruct[hash].index = typeIndex.push(hash) - 1;
        typeStruct[hash].enabled = false;

        emit LogNew(hash, typeStruct[hash].index);
        return hash;
    }

    function insertBytes(bytes memory data) public returns (bytes32 hasho) {
        return insert(PermissionTypeLib.structureBytes(data));
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

    function update(bytes32 hashi, PermissionTypeLib.PermissionType memory data)
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

    function isEnabled(bytes32 hash) public view returns(bool isIndeed) {
        return isStored(hash) && typeStruct[hash].enabled;
    }

    function getByHash(bytes32 hash) public view returns(PermissionTypeLib.PermissionTypeRequired memory data) {
        if(!isEnabled(hash)) revert("No such data inserted.");
        return typeStruct[hash].data;
    }

    function count() public view returns(uint256 counter) {
        return typeIndex.length;
    }
}
