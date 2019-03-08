# dType
Proposals and specs for a decentralized type system.

This is primarily for Solidity and introduces a transpiler dTypeSol to Solidity.

## dTypeSol

dTypeSol is a flavor of Solidity that accepts the types published on chain and transpils them into classic Solidity types or adds all necessay inclusions if developer wants to use the structures instead of atomic types (uint256, string, boolean, etc.)

## Types Contract

The struct for storing the types could be of the form:

```
struct Type {
    bytes32 id;
    string name;
    string stype;
    bytes32[] types;
    address contractAddress;
    uint256 index;
}

```

The rest of type management is coded in contract file dType.sol [https://github.com/ctzurcanu/dType/blob/master/contracts/dType.sol] .





