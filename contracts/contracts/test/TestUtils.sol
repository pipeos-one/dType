pragma solidity ^0.5.0;

contract TestUtils {
    function getSignature(string memory functionName) pure public returns (bytes4 signature) {
        return bytes4(keccak256(abi.encodePacked(functionName)));
    }
}
