pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

library dTypeProposalLib {

    struct TypeProposal {
        uint256 id;
        string name;
    }

    function structure(uint256 id, string memory name)
        pure
        internal
        returns(TypeProposal memory proposal)
    {
        return TypeProposal(id, name);
    }

    function destructure(TypeProposal memory proposal)
        pure
        internal
        returns (uint256 id, string memory name)
    {
        return (proposal.id, proposal.name);
    }

    function structureBytes(bytes memory data)
        pure
        internal
        returns(TypeProposal memory proposal)
    {
        (proposal) = abi.decode(data, (TypeProposal));
    }

    function destructureBytes(TypeProposal memory proposal)
        pure
        internal
        returns(bytes memory data)
    {
        return abi.encode(proposal);
    }

    function map(
        address callbackAddr,
        bytes4 callbackSig,
        TypeProposal[] memory proposalAarr
    )
        view
        internal
        returns (TypeProposal[] memory result)
    {
        uint length = proposalAarr.length;
        result = new TypeProposal[](length);

        for (uint i = 0; i < length; i++) {
            (bool success, bytes memory data) = callbackAddr.staticcall(abi.encodeWithSelector(callbackSig, proposalAarr[i]));

            require(success, "Map callback failed");
            result[i] = structureBytes(data);
        }

        return result;
    }
}
