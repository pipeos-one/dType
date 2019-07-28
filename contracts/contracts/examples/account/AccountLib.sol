pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

library AccountLib {

    struct Account {
        address addr;
    }

    function insert(Account storage self, Account memory instance) internal {
        self.addr = instance.addr;
    }

    function getDataHash(Account memory instance) pure public returns(bytes32 hash) {
        return keccak256(abi.encode(instance.addr));
    }

    function structureBytes(bytes memory data)
        pure
        public
        returns(Account memory instance)
    {
        (instance) = abi.decode(data, (Account));
    }

    function destructureBytes(Account memory instance)
        pure
        public
        returns(bytes memory data)
    {
        return abi.encode(instance);
    }
}
