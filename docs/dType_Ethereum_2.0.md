# Research: dType on Ethereum 2.0

For more information about dType and existing EIPs, check [README.md](../README.md).

This document is an ongoing effort to research possible implementations for dType on the future Ethereum 2.0.

It is work in progress. Some ideas might be outdated (especially as Eth2 spec changes), some might be improbable.

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
