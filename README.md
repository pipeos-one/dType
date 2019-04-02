# dType

We are proposing a Decentralized Type System for Ethereum, to introduce data definition (and therefore ABI) consistency.

In-work EIP proposal: https://github.com/ethereum/EIPs/pull/1900
Discussions at: https://github.com/ethereum/EIPs/issues/1882

A video demo of the current implementation (a more extended version of the ERC-1882 proposal), can be seen at https://youtu.be/pcqi4yWBDuQ.

## Vision

System Registry for The World Computer: https://medium.com/@loredana.cirstea/a-vision-of-a-system-registry-for-the-world-computer-be1dc2da7cae


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

### Client app:

```
cd client
npm install
npm run start
```

For the client app to run correctly, you need to first deploy the contracts with `truffle migrate` and connect with Metamask to the testnet/private network.
