pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import './dTypeProposalLib.sol';
import './dTypeOptionStakedLib.sol';

library dTypeVotingLib {
    using dTypeProposalLib for dTypeProposalLib.TypeProposal;
    using dTypeOptionStakedLib for dTypeOptionStakedLib.TypeOptionStaked;

    struct TypeVoting {
        dTypeProposalLib.TypeProposal proposal;
        dTypeOptionStakedLib.TypeOptionStaked[] options;
    }

    function structure(dTypeProposalLib.TypeProposal memory proposal, dTypeOptionStakedLib.TypeOptionStaked[] memory options)
        pure
        internal
        returns(TypeVoting memory voting)
    {
        return TypeVoting(proposal, options);
    }

    function destructure(TypeVoting memory voting)
        pure
        internal
        returns (dTypeProposalLib.TypeProposal memory proposal, dTypeOptionStakedLib.TypeOptionStaked[] memory options)
    {
        return (voting.proposal, voting.options);
    }

    function structureBytes(bytes memory data)
        pure
        internal
        returns(TypeVoting memory voting)
    {
        (voting) = abi.decode(data, (TypeVoting));
    }

    function destructureBytes(TypeVoting memory voting)
        pure
        internal
        returns(bytes memory data)
    {
        return abi.encode(voting);
    }

    function map(
        address callbackAddr,
        bytes4 callbackSig,
        TypeVoting[] memory votingArr
    )
        view
        internal
        returns (TypeVoting[] memory result)
    {
        uint length = votingArr.length;
        result = new TypeVoting[](length);

        for (uint i = 0; i < length; i++) {
            (bool success, bytes memory data) = callbackAddr.staticcall(abi.encodeWithSelector(callbackSig, votingArr[i]));

            require(success, "Map callback failed");
            result[i] = structureBytes(data);
        }

        return result;
    }
}
