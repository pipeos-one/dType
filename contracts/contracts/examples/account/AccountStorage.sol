pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import '../../StorageBase.sol';
import './AccountLib.sol';

contract AccountStorage is StorageBase {
    using AccountLib for AccountLib.Account;

    mapping(bytes32 => Type) public typeStruct;

    struct Type {
        AccountLib.Account data;
        uint256 index;
    }

    modifier dataIsStored (bytes32 hash) {
        require(isStored(hash), "No such data inserted.");
        _;
    }

    function insert(AccountLib.Account memory data) public returns (bytes32 hash) {
        // for data integrity
        bytes32 hash = data.getDataHash();

        if(isStored(hash)) revert("This data exists. Use the extant data.");

        typeStruct[hash].data.insert(data);
        typeStruct[hash].index = typeIndex.push(hash) - 1;
        emit LogNew(hash, typeStruct[hash].index);
        return hash;
    }

    function update(bytes32 hashi, AccountLib.Account memory data)
        public
        returns(bytes32 hash)
    {
        remove(hashi);
        return insert(data);
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

    function isStored(bytes32 hash) public view returns(bool isIndeed) {
        if(typeIndex.length == 0) return false;
        return (typeIndex[typeStruct[hash].index] == hash);
    }

    function getByHash(bytes32 hash) public view returns(AccountLib.Account memory data) {
        return typeStruct[hash].data;
    }
}
