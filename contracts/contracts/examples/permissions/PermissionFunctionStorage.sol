pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import './PermissionFunctionInterface.sol';
import '../../StorageBase.sol';

contract PermissionFunctionStorage is StorageBase {
    using PermissionFunctionLib for PermissionFunctionLib.PermissionFunction;
    using PermissionFunctionLib for PermissionFunctionLib.PermissionFunctionRequired;

    mapping(bytes32 => Type) public typeStruct;
    mapping(bytes32 => mapping(address => PermissionFunctionLib.PermissionFunctionRequired)) public inreview;

    struct Type {
        PermissionFunctionLib.PermissionFunctionRequired data;
        uint256 index;
    }

    modifier dataIsStored (bytes32 hash) {
        require(isStored(hash), "No such data inserted.");
        _;
    }

    function insert(PermissionFunctionLib.PermissionFunction memory data) public returns (bytes32 hash) {
        // for data integrity
        hash = data.getDataHash();

        insertPrivate(hash, data.getRequired());
    }

    function insertReview(address proponent, PermissionFunctionLib.PermissionFunction memory data) public returns (bytes32 hash) {
        hash = data.getDataHash();
        inreview[hash][proponent].insert(data);
        emit LogNewReview(hash, proponent);
    }

    function insertBytes(bytes memory data) public returns (bytes32 hash) {
        return insert(PermissionFunctionLib.structureBytes(data));
    }

    function remove(bytes32 hash) public returns(uint256 index) {
        require(isStored(hash), 'Not deleted: not extant');

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

        delete inreview[hash][proponent];
        emit LogRemoveReview(hash, proponent);
    }

    function update(bytes32 hashi, PermissionFunctionLib.PermissionFunction memory data)
        public
        returns(bytes32 hash)
    {
        remove(hashi);
        return insert(data);
    }

    function updateReview(address proponent, PermissionFunctionLib.PermissionFunction memory data)
        public
    {
        // You can use update for removing the proposal if you provide data values of 0
        // require(isStored(hash), 'Not extant');
        bytes32 hash = data.getDataHash();
        inreview[hash][proponent].insert(data);
        emit LogUpdateReview(hash, proponent);
    }

    function accept(address proponent, bytes32 hash) public {
        if (!isStored(hash)) {
            PermissionFunctionLib.PermissionFunctionRequired memory permission = inreview[hash][proponent];
            insertPrivate(hash, permission);
        } else {
            typeStruct[hash].data = inreview[hash][proponent];
        }
        delete inreview[hash][proponent];
        emit LogAccepted(hash, proponent);
    }

    function dismiss(address proponent, bytes32 hash) public {
        inreview[hash][proponent] = typeStruct[hash].data;
        remove(hash);
        emit LogDismissed(hash, proponent);
    }

    function isStored(bytes32 hash) public view returns(bool isIndeed) {
        if(typeIndex.length == 0) return false;
        return (typeIndex[typeStruct[hash].index] == hash);
    }

    function getByHash(bytes32 hash) public view returns(PermissionFunctionLib.PermissionFunctionRequired memory data) {
        return typeStruct[hash].data;
    }

    function get(address contractAddress, bytes4 functionSig) public view returns(PermissionFunctionLib.PermissionFunctionRequired memory data) {
        return getByHash(keccak256(abi.encode(contractAddress, functionSig)));
    }

    function insertPrivate(bytes32 hash, PermissionFunctionLib.PermissionFunctionRequired memory data) private {
        if(isStored(hash)) revert("This data exists. Use the extant data.");

        typeStruct[hash].data = data;
        typeStruct[hash].index = typeIndex.push(hash) - 1;

        emit LogNew(hash, typeStruct[hash].index);
    }
}
