pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

// import './TypeStorageInterface.sol';

contract TypeStorage  {// is TypeStorageInterface {


    mapping(bytes32 => SStorage) public typeStruct;
    bytes32[] public typeIndex;

    struct Type1 {
        uint256 balance;
        address owner;
    }

    struct SStorage {
        Type1 data;
        uint256 index;
    }

    event LogNew(bytes32 indexed hash, uint256 indexed index);
    event LogUpdate(bytes32 hash, uint256 indexed index);
    event LogRemove(bytes32 hash, uint256 indexed index);


    function isStored(bytes32 hash) public view returns(bool isIndeed) {
        if(typeIndex.length == 0) return false;
        return (typeIndex[typeStruct[hash].index] == hash);
    }

    function insert(Type1 memory data) public returns (bytes32 hasho, uint256 index) {

        // for data integrity
        bytes32 hash = keccak256(abi.encode(data));
        if(isStored(hash)) revert("This data exists. Use the extant data.");

        typeStruct[hash].data = data;
        typeStruct[hash].index = typeIndex.push(hash) - 1;
        emit LogNew(hash, typeStruct[hash].index);
        return (hash, typeStruct[hash].index);
    }

    function get(bytes32 hash) public view returns(Type1 memory data) {
        if(!isStored(hash)) revert("No such data inserted.");
        return(typeStruct[hash].data);
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

    function update(bytes32 hashi, Type1 memory data)
        public
        returns(bytes32 hash, uint256 index)
    {
        remove(hashi);
        return insert(data);
    }

    function count() public view returns(uint256 counter) {
        return typeIndex.length;
    }
}
