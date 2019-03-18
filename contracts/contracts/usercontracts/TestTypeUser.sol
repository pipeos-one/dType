pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import '../dtypes/TestTypeContract.sol';

contract TestTypeUser is TestTypeContract {
    uint256 public counter = 1;

    mapping(uint256 => Type1) public storageData;
    mapping(uint256 => bytes32) referenceData;

    function insertData() public {
        bytes32 hash;
        uint256 index;

        Type1 memory test = Type1(1, msg.sender);
        storageData[counter] = test;

        (bool success, bytes memory data) = this.getStorageContract().call(abi.encodeWithSignature("insert(Type1)", test));
        assembly {
            hash := mload(add(data, 32))
            index := mload(add(data, 64))
        }
        referenceData[counter] = hash;
        counter += 1;
    }

    /* function get(uint256 index) public returns(Type1 memory type1) {
        (bool success, bytes memory data) = this.getStorageContract().call(abi.encodeWithSignature("get(bytes32)", referenceData[index]));
    } */
}
