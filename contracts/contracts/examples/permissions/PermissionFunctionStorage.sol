pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import './PermissionFunctionInterface.sol';

contract PermissionFunctionStorage is PermissionFunctionInterface {
    using PermissionFunctionLib for PermissionFunctionLib.PermissionFunction;
    using PermissionFunctionLib for PermissionFunctionLib.PermissionFunctionRequired;

    bytes32[] public typeIndex;
    mapping(bytes32 => Type) public typeStruct;

    struct Type {
        PermissionFunctionLib.PermissionFunctionRequired data;
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

    function insert(PermissionFunctionLib.PermissionFunction memory data) public returns (bytes32 hasho) {

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
        return insert(PermissionFunctionLib.structureBytes(data));
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

    function update(bytes32 hashi, PermissionFunctionLib.PermissionFunction memory data)
        public
        returns(bytes32 hash)
    {
        remove(hashi);
        return insert(data);
    }

    function enable(bytes32 hash) public {
        typeStruct[hash].enabled = true;
    }

    function disable(bytes32 hash) public {
        typeStruct[hash].enabled = false;
    }

    function isStored(bytes32 hash) public view returns(bool isIndeed) {
        if(typeIndex.length == 0) return false;
        return (typeIndex[typeStruct[hash].index] == hash);
    }

    function isEnabled(bytes32 hash) public view returns(bool isIndeed) {
        return isStored(hash) && typeStruct[hash].enabled;
    }

    function getByHash(bytes32 hash) public view returns(PermissionFunctionLib.PermissionFunctionRequired memory data) {
        if(!isEnabled(hash)) {
            return data;
        }
        return typeStruct[hash].data;
    }

    function get(address contractAddress, bytes4 functionSig) public view returns(PermissionFunctionLib.PermissionFunctionRequired memory data) {
        return getByHash(keccak256(abi.encode(contractAddress, functionSig)));
    }

    function count() public view returns(uint256 counter) {
        return typeIndex.length;
    }
}
