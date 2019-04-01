pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import './dTypeVotingLib.sol';

contract dTypeVotingFunctions {
    using dTypeVotingLib for dTypeVotingLib.TypeVoting;

    // function double(typeALib.TypeA memory typeA)
    //     pure
    //     public
    //     returns(typeALib.TypeA memory result)
    // {
    //     typeA.balance *= 2;
    //     return typeA;
    // }
    //
    // function doubleBalances(typeALib.TypeA[] memory typeAarr)
    //     view
    //     public
    //     returns(typeALib.TypeA[] memory result)
    // {
    //     return typeALib.map(address(this), this.double.selector, typeAarr);
    // }
}
