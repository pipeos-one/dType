pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import './PermissionStorageInterface.sol';
import '../../StorageBase.sol';

contract PermissionStorage is StorageBase {
    using PermissionLib for PermissionLib.Permission;
    using PermissionLib for PermissionLib.PermissionRequired;
    using PermissionLib for PermissionLib.PermissionFull;
    using PermissionLib for PermissionLib.PermissionIdentifier;

    mapping(bytes32 => Type) public typeStruct;

    mapping(bytes32 => PermissionProcessLib.PermissionProcess) public permissionProcess;

    mapping(bytes32 => mapping(address => PermissionLib.PermissionFull)) public inreview;

    struct Type {
        PermissionLib.PermissionRequired data;
        uint256 index;
    }

    modifier dataIsStored (bytes32 hash) {
        require(isStored(hash), "No such data inserted.");
        _;
    }

    function insert(PermissionLib.Permission memory data) public returns (bytes32 hash) {
        hash = data.getDataHash();

        insertPrivate(hash, data.getFull());
    }

    function insertReview(address proponent, bytes memory rawdata) public returns (bytes32 hash) {
        PermissionLib.Permission memory data = PermissionLib.structureBytes(rawdata);
        hash = data.getDataHash();

        inreview[hash][proponent] = data.getFull();
        emit LogNewReview(hash, proponent);
    }

    function insertBytes(bytes memory data) public returns (bytes32 hash) {
        return insert(PermissionLib.structureBytes(data));
    }

    function remove(bytes32 hash) public returns(uint256 index) {
        require(isStored(hash), 'Not deleted: not extant');

        uint rowToDelete = typeStruct[hash].index;
        bytes32 keyToMove = typeIndex[typeIndex.length-1];
        typeIndex[rowToDelete] = keyToMove;
        typeStruct[keyToMove].index = rowToDelete;
        typeIndex.length--;

        delete typeStruct[hash];
        delete permissionProcess[hash];

        emit LogRemove(hash, rowToDelete);
        emit LogUpdate(keyToMove, rowToDelete);

        return rowToDelete;
    }

    function removeReview(address proponent, bytes32 hash) public {
        require(isStored(hash), 'Not extant');

        delete inreview[hash][proponent];
        emit LogRemoveReview(hash, proponent);
    }

    function update(bytes32 hashi, PermissionLib.Permission memory data)
        public
        returns(bytes32 hash)
    {
        remove(hashi);
        return insert(data);
    }

    function updateReview(address proponent, bytes memory rawdata)
        public
    {
        // You can use update for removing the proposal if you provide data values of 0
        PermissionLib.Permission memory data = PermissionLib.structureBytes(rawdata);
        bytes32 hash = data.getDataHash();

        inreview[hash][proponent] = data.getFull();
        emit LogUpdateReview(hash, proponent);
    }

    function accept(address proponent, bytes32 hash) public {
        if (!isStored(hash)) {
            PermissionLib.PermissionFull memory data = inreview[hash][proponent];
            insertPrivate(hash, data);
        } else {
            typeStruct[hash].data = inreview[hash][proponent].getRequired();
            permissionProcess[hash] = inreview[hash][proponent].permissionProcess;
        }
        delete inreview[hash][proponent];
        emit LogAccepted(hash, proponent);
    }

    function dismiss(address proponent, bytes32 hash) public {
        inreview[hash][proponent] = typeStruct[hash].data.getFull(permissionProcess[hash]);
        remove(hash);
        emit LogDismissed(hash, proponent);
    }

    function isStored(bytes32 hash) public view returns(bool isIndeed) {
        if(typeIndex.length == 0) return false;
        return (typeIndex[typeStruct[hash].index] == hash);
    }

    function getByHash(bytes32 hash) public view returns(PermissionLib.PermissionFull memory data) {
        return typeStruct[hash].data.getFull(permissionProcess[hash]);
    }

    function get(PermissionLib.PermissionIdentifier memory identifier) public view returns(PermissionLib.PermissionFull memory data) {
        return getByHash(identifier.getDataHash());
    }

    function insertPrivate(bytes32 hash, PermissionLib.PermissionFull memory data) private {
        if(isStored(hash)) revert("This data exists. Use the extant data.");

        typeStruct[hash].data = data.getRequired();
        typeStruct[hash].index = typeIndex.push(hash) - 1;

        permissionProcess[hash] = data.permissionProcess;

        emit LogNew(hash, typeStruct[hash].index);
    }
}
