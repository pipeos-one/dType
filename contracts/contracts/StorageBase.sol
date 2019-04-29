pragma solidity ^0.5.0;

contract StorageBase {
    bytes32[] public typeIndex;

    event LogNew(bytes32 indexed hash, uint256 indexed index);
    event LogUpdate(bytes32 indexed hash, uint256 indexed index);
    event LogRemove(bytes32 indexed hash, uint256 indexed index);

    event LogNewReview(bytes32 indexed hash, address indexed proponent);
    event LogUpdateReview(bytes32 indexed hash, address indexed proponent);
    event LogRemoveReview(bytes32 indexed hash, address indexed proponent);

    event LogAccepted(bytes32 indexed hash, address indexed proponent);
    event LogDismissed(bytes32 indexed hash, address indexed proponent);

    function count() public view returns(uint256 counter) {
        return typeIndex.length;
    }
}
