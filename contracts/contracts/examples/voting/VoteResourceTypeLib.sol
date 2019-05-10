pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

library VoteResourceTypeLib {

    struct VoteResource {
        address proponent;
        address contractAddress;
        bytes32 dataHash;
        bytes32 votingProcessDataHash;
        uint256 scoreyes;
        uint256 scoreno;
    }

    function insert(VoteResource storage self, VoteResource memory data) internal {
        self.proponent = data.proponent;
        self.contractAddress = data.contractAddress;
        self.dataHash = data.dataHash;
        self.votingProcessDataHash = data.votingProcessDataHash;
        self.scoreyes = 0;
        self.scoreno = 0;
    }

    function getDataHash(VoteResource memory data) pure public returns(bytes32 hash) {
        return keccak256(abi.encode(data.contractAddress, data.dataHash, data.proponent));
    }

    function getFull(
        VoteResource memory data
    )
        pure
        public
        returns(VoteResource memory dataFull)
    {
        return data;
    }

    function structureBytes(bytes memory data)
        pure
        public
        returns(VoteResource memory dataStruct)
    {
        (dataStruct) = abi.decode(data, (VoteResource));
    }

    function destructureBytes(VoteResource memory dataStruct)
        pure
        public
        returns(bytes memory data)
    {
        return abi.encode(dataStruct);
    }

    function map(
        address callbackAddr,
        bytes4 callbackSig,
        VoteResource[] memory dataArr
    )
        view
        public
        returns (VoteResource[] memory result)
    {
        uint length = dataArr.length;
        result = new VoteResource[](length);

        for (uint i = 0; i < length; i++) {
            (bool success, bytes memory data) = callbackAddr.staticcall(abi.encodeWithSelector(callbackSig, dataArr[i]));

            require(success, "Map callback failed");
            result[i] = structureBytes(data);
        }

        return result;
    }
}
