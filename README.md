# dType

We are proposing a Decentralized Type System for Ethereum, to introduce data definition (and therefore ABI) consistency.

In-work EIP proposal and discussions at: https://github.com/ethereum/EIPs/issues/1882

A video demo of the current implementation (a more extended version of the ERC-1882 proposal), can be seen at https://youtu.be/pcqi4yWBDuQ.

## Vision

System Registry for The World Computer: https://medium.com/@loredana.cirstea/a-vision-of-a-system-registry-for-the-world-computer-be1dc2da7cae


## Specs


### Type Registry Contract


```
struct dType {
    address contractAddress;
    bytes32 source;
    string name;
    string[] types;
    string[] labels;
}

```

See [dType.sol](/contracts/dType.sol).


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
