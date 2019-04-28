pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

library VotingProcessLib {

    struct VotingProcessRequired {
        bytes32 votingMechanismDataHash;
        bytes4 funcHashYes;
        bytes4 funcHashNo;
    }

    struct VotingProcess {
        address contractAddress;
        bytes4 funcHash;
        bytes32 votingMechanismDataHash;
        bytes4 funcHashYes;
        bytes4 funcHashNo;
    }

    function insert(VotingProcessRequired storage self, VotingProcess memory data) internal {
        self.votingMechanismDataHash = data.votingMechanismDataHash;
        self.funcHashYes = data.funcHashYes;
        self.funcHashNo = data.funcHashNo;
    }

    function getDataHash(VotingProcess memory data) pure public returns(bytes32 hash) {
        return keccak256(abi.encode(
            data.contractAddress,
            data.funcHash
        ));
    }

    function structureBytes(bytes memory data)
        pure
        public
        returns(VotingProcess memory dataStruct)
    {
        (dataStruct) = abi.decode(data, (VotingProcess));
    }

    function destructureBytes(VotingProcess memory dataStruct)
        pure
        public
        returns(bytes memory data)
    {
        return abi.encode(dataStruct);
    }
}
