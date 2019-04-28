pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import './VoteParametersLib.sol';

library VotingMechanismTypeLib {

    struct VotingMechanism {
        bytes32[] processVoteFunctions;
        bytes32[] processStateFunctions;
        VoteParametersLib.VoteParameters parameters;
    }

    function insert(VotingMechanism storage self, VotingMechanism memory data) internal {
        self.processVoteFunctions = data.processVoteFunctions;
        self.processStateFunctions = data.processStateFunctions;
        self.parameters = data.parameters;
    }

    function getDataHash(VotingMechanism memory data) pure public returns(bytes32 hash) {
        return keccak256(abi.encode(data));
    }

    function structureBytes(bytes memory data)
        pure
        public
        returns(VotingMechanism memory dataStruct)
    {
        (dataStruct) = abi.decode(data, (VotingMechanism));
    }

    function destructureBytes(VotingMechanism memory dataStruct)
        pure
        public
        returns(bytes memory data)
    {
        return abi.encode(dataStruct);
    }

    function map(
        address callbackAddr,
        bytes4 callbackSig,
        VotingMechanism[] memory dataArr
    )
        view
        public
        returns (VotingMechanism[] memory result)
    {
        uint length = dataArr.length;
        result = new VotingMechanism[](length);

        for (uint i = 0; i < length; i++) {
            (bool success, bytes memory data) = callbackAddr.staticcall(abi.encodeWithSelector(callbackSig, dataArr[i]));

            require(success, "Map callback failed");
            result[i] = structureBytes(data);
        }

        return result;
    }
}
