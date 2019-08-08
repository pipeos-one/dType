pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

library PhysicalAddressLib {

    struct PhysicalAddress {
        // bytes3 countryCode;
        // bytes24 city;
        // bytes22 streetName;
        // bytes10 postcode;
        // uint16 streetNo;
        // bytes16 location;
        string countryCode;
        string city;
        string streetName;
        string postcode;
        uint16 streetNo;
        string location;
    }

    function insert(PhysicalAddress storage self, PhysicalAddress memory instance) internal {
        self.countryCode = instance.countryCode;
        self.city = instance.city;
        self.streetName = instance.streetName;
        self.postcode = instance.postcode;
        self.streetNo = instance.streetNo;
        self.location = instance.location;
    }

    function getDataHash(PhysicalAddress memory instance) pure public returns(bytes32 hash) {
        return keccak256(abi.encode(instance));
    }

    function structureBytes(bytes memory data)
        pure
        public
        returns(PhysicalAddress memory instance)
    {
        (instance) = abi.decode(data, (PhysicalAddress));
    }

    function destructureBytes(PhysicalAddress memory instance)
        pure
        public
        returns(bytes memory data)
    {
        return abi.encode(instance);
    }
}
