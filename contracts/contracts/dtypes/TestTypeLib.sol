pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

library TestTypeLib {
    struct TestStruct {
        uint256 test1;
        string test2;
        bytes32 test3;
    }

    /* function insert() public returns (bytes32 indexed hash, uint256 indexed index) {
        address storage =
        call(abi.encodeWithSignature("f(uint256)", a, b))
    }

    function getStorageAddress() pure public returns (address typeStorage) {
        return ''
    } */

    function destructure(TestStruct memory testStruct)
        pure
        public
        returns (uint256 test1, string memory test2, bytes32 test3)
    {
        return (testStruct.test1, testStruct.test2, testStruct.test3);
    }

    function structure(uint256 test1, string memory test2, bytes32 test3)
        pure
        public
        returns (TestStruct memory testStruct)
    {
        return TestStruct(test1, test2, test3);
    }
}
