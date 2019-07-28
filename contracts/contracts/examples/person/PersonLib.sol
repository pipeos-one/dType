pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

library PersonLib {

    struct Person {
        string fullname;
    }

    function insert(Person storage self, Person memory instance) internal {
        self.fullname = instance.fullname;
    }

    function getDataHash(Person memory instance) pure public returns(bytes32 hash) {
        return keccak256(abi.encode(instance.fullname));
    }

    function structureBytes(bytes memory data)
        pure
        public
        returns(Person memory instance)
    {
        (instance) = abi.decode(data, (Person));
    }

    function destructureBytes(Person memory instance)
        pure
        public
        returns(bytes memory data)
    {
        return abi.encode(instance);
    }
}
