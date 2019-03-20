pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import './typeALib.sol';
import './typeBLib.sol';

contract typeABLogic {
    using typeALib for typeALib.TypeA;
    using typeBLib for typeBLib.TypeB;

    function setStaked(typeALib.TypeA memory typeA)
        pure
        public
        returns(typeBLib.TypeB memory typeB)
    {
        typeB.staked = typeA.balance / 2;
        return typeB;
    }
}
