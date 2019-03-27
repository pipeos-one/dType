# dType
Proposals and specs for a decentralized type system.

This is primarily for Solidity and introduces a transpiler dTypeSol to Solidity.

## dTypeSol

dTypeSol is a flavor of Solidity that accepts the types published on chain and transpils them into classic Solidity types or adds all necessay inclusions if developer wants to use the structures instead of atomic types (uint256, string, boolean, etc.)

## Types Contract

The struct for storing the types could be of the form:

```
struct Type {
    string name;
    bytes32[] types;
    bool isArray;
    address contractAddress;
    bytes32 source;
    uint256 index;
}

```

The rest of type management is coded in contract file dType.sol [https://github.com/ctzurcanu/dType/blob/master/contracts/dType.sol] .


## Development

### Contracts

Prerequisites:

```
npm install -g truffle
```

Compile:

```
cd contracts
truffle compile
```

Test:

```
truffle test
truffle test test/dtype.js
```

Deployment prerequisites:

```
mkdir private
cd private
touch infuraKey.txt
touch privateKey.txt
touch privateKey.json
```

Deployment commands:

Ganache is set on port 8545.

```
truffle migrate --network ganache
```

### Client app:

```
cd client
npm install
npm run start
```

For the client app to run correctly, you need to first deploy the contracts with `truffle migrate` and connect with Metamask to the testnet/private network.
