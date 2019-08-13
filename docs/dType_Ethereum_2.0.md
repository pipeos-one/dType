# Research: dType on Ethereum 2.0

For more information about dType and existing EIPs, check [README.md](../README.md).

This document is an ongoing effort to research possible implementations and usecases for dType on the future Ethereum 2.0.

It is work in progress.

## ethresear.ch Proposals

- [dType (Decentralized Type System) on Ethereum 2.0](https://ethresear.ch/t/dtype-decentralized-type-system-on-ethereum-2-0/5721)
- [A Master Shard to Account for Ethereum 2.0 Global Scope](https://ethresear.ch/t/a-master-shard-to-account-for-ethereum-2-0-global-scope/5730)
- [Libra EE and Shadow Shard (and general cross-chain data bridging)](https://ethresear.ch/t/libra-ee-and-shadow-shard-and-general-cross-chain-data-bridging/5919)
- [Data/Load Balancing of Shards](https://ethresear.ch/t/data-load-balancing-of-shards/5961)


## Questions:
- how can we access dType as if it were in the global scope, across shards? (fast, cheap)
- data seeding - can the beacon chain store a minimal dType state (shardId, dtypeId, dtypeItemId), used by shards to verify if a type is part of dType
- can a dType library from shard A be used/imported in a shard B smart contract without deploying it on shard B? (yanking probably isn't the way)
- can a type storage contract record from shard A be accessed in shard B? (yanking, async cross-shard txn)


## TBD:
- a way for the shards to collaborate on data
- transactions should contain metadata regarding dType use
- dType opcodes should exist for the eWasm VM to facilitate the construction of such metadata
- Functions/opcodes for the Beacon Chain:
    - dTypeAdd <shard> <dtype> <dtype item>
    - dTypeRemove <shard> <dtype> <dtype item>
    - dTypeUpdate <shard> <dtype> <dtype item1> <dtype item2>
    - dTypeExists <shard> <dtype> <dtype item>
- merkelization for dtype - type checking + integrity (name+def)
- eth2 types in dType - e.g. address: https://ethresear.ch/t/phase-2-pre-spec-cross-shard-mechanics/4970
