# dType

[![Join the chat at https://gitter.im/pipeos-one/dType](https://badges.gitter.im/pipeos-one/dType.svg)](https://gitter.im/pipeos-one/dType?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

dType is a Decentralized Type System for a Global OS, for Ethereum. A global type system enables independently built system parts to interoperate. Developers should agree on standardizing common types and a type registry, continuously working on improving them, to become part of the Global OS. Ethereum could become the origin for defining types for other programming languages.

dType supports any Solidity type, including functions, along with custom user types. dType assigns a unique global identifier for each type and stores data needed to recompose the type's ABI. Various storage mechanism extensions can be optionally integrated with dType, enabling efficient blockchain data analysis, especially by blockchain explorers, without relying on off-chain centralized services to provide ABI data.

## ERCs
1. [EIP-1900: dType - Decentralized Type System for EVM](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1900.md), discussions [here](https://github.com/ethereum/EIPs/issues/1882)
2. [EIP-2157: dType Storage Extension - Decentralized Type System for EVM](https://github.com/ethereum/EIPs/pull/2158)
3. [EIP-xxxx: dType - Extending the Decentralized Type System for Functions](https://github.com/ethereum/EIPs/issues/1921)

## Ethereum 2.0

In research: [dType on Eth2](./docs/dType_Ethereum_2.0.md).

## Demos

Playlist: https://www.youtube.com/playlist?list=PL323JufuD9JC46yClCf5fdaEX17kocem7

## Vision

- [System Registry for The World Computer](https://medium.com/@loredana.cirstea/a-vision-of-a-system-registry-for-the-world-computer-be1dc2da7cae)
- [dType — Decentralized Type System & Functional Programming on Ethereum](https://medium.com/@loredana.cirstea/dtype-decentralized-type-system-functional-programming-on-ethereum-4f7666377c9f)
- [Ethereum, Libra and a Unified Type System](https://medium.com/@loredana.cirstea/ethereum-libra-and-a-unified-type-system-7cafa6ea0bc0)


## Specs

![dType](/docs/images/dType.png)

### dType Registry Contract

Types are registered in the `dType` contract. See [dType.sol](/contracts/contracts/dType.sol).


```
struct dType {
    address contractAddress;
    bytes32 source;
    string name;
    string[] types;
    string[] labels;
}

```

### Type Contract

A type must implement a library and a contract that stores the Ethereum address of that library, along with other contract addresses related to that type (e.g. smart contract for storing the data entries for that type).

```
contract TypeRootContract {
  address public libraryAddress;
  address public storageAddress;

  constructor(address _library, address _storage) public {
    require(_library != address(0x0));
    libraryAddress = _library;
    storageAddress = _storage;
  }
}
```

A type library contains the definition of the type, along with helper functions.
Example [typeALib.sol](/contracts/contracts/dtypes/typeALib.sol).

A type storage contract contains data entries for the type.
Example [typeAContract.sol](/contracts/contracts/dtypes/typeAContract.sol).

### Functional Programming Pattern

Example for functional programming with `dType.run()`.

![runExample](/docs/images/seq-typedFunc.svg)

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
touch privateKey.json
```

Deployment commands:

Ganache is set on port 8545.

```
truffle migrate --network ganache
```

### Client App

#### Build dType UI Packages

Contains core packages for dType and example packages for each type.

Future plans:
- type packages will be published on Swarm/IPFS and loaded on demand in the client app

```sh
cd dType
npm install
lerna bootstrap
lerna run build
```

#### Run Client

```sh
cd client
# Remove dType/client/package-lock.json if npm install fails, and try again
npm install
npm run start
```

For the client app to run correctly, you need to first deploy the contracts with `truffle migrate` and connect with Metamask to the testnet/private network.
