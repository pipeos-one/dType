pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

// import './TypeStorageInterface.sol';

contract TestTypeContract {
    // TypeStorageInterface storageContract;
    address storageContract;
    address typeContract;

    struct Type1 {
        uint256 balance;
        address owner;
    }

    function setStorageContract(address storageAddress) public {
        // storageContract = TypeStorageInterface(storageAddress);
        storageContract = storageAddress;
    }

    function getStorageContract() public view returns (address storageC) {
        return address(storageContract);
    }

    function structure( uint256 balance, address owner) public pure returns(Type1 memory type1) {
        return Type1(balance, owner);
    }

    function destructure(Type1 memory type1) public pure returns (uint256 balance, address owner) {
        return (type1.balance, type1.owner);
    }
}
