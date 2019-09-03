# dType Opcodes

```
eip: <to be assigned>
title: dType Opcodes
author: Loredana Cirstea (@loredanacirstea), Christian Tzurcanu (@ctzurcanu)
discussions-to: <URL>
status: Draft
type: Standards Track
category: Core
created: 2019-09-02
requires: 1900
```

## Simple Summary

This EIP adds new opcodes for enabling the use of decentralized data types and typed data in the EVM, without needing to import type definitions from libraries or data storage contract interfaces in a new smart contract.


## Abstract

[EIP-1900](http://eips.ethereum.org/EIPS/eip-1900) is proposing a type registry for storing the description of type interfaces, along with references to the type definition libraries and data storage contracts for data of each type.

This EIP optimizes the use of such a smart contract registry, by proposing opcodes for accessing type definitions and rules, along with data items and functions pertaining to that type.


## Motivation

The EVM does not have support for custom types, even though higher-level languages have (e.g. Solidity). However, developers need to know beforehand the libraries and contracts where those types are defined, making it hard and expensive to reuse types defined by others.

Having dType contracts accessible in the EVM removes the need to import type definition libraries at compile time. We are also proposing a dType Trie, where the types data will be cached, making retrieval and function use more efficient than the current Storage Trie.

The EVM will know the address of the dType registry contract and will be able to retrieve the type information, along with the type rules if they are defined.
The new smart contract bytecode will, therefore, contain the type identifier. This can be added in contract events and in the ABI interfaces. Blockchain explorers would benefit, being able to actually analyze and label data without relying on off-chain centralized services to provide ABIs. That is how Libra/Move IR does it.

## Specification

### 1) `DTYPED`

A new opcode is introduced for referencing a type definition: `DTYPED`. The opcode takes a `bytes32` dType identifier (unique), as proposed in [EIP-1900](http://eips.ethereum.org/EIPS/eip-1900). This `dTypeIdentifier` is calculated as `keccak(0, dTypeName)`, where `0` is the language identifier for the EVM and `dTypeName` is the name of the type, as registered in the dType registry. 

E.g.: `DTYPED(dTypeIdentifier)`

TBD: `DTYPED` may also need a `bytes20` argument, for specifying the Ethereum address of the dType registry. So, the form could be: `DTYPED(dTypeRegAddress, dTypeIdentifier)`


```solidity
uint language = 0;  // EVM code is 0
string dTypeName = 'MarketProduct';
bytes32 dTypeIdentifier = keccak256(abi.encode(language, dTypeName);
```

### 2) `DTYPE`

A new opcode is introduced, for calling type functions: `DTYPE`. The opcode takes a `functionSignature` argument, which is the `bytes4` signature of the function and a variable number of arguments `stackX` to be passed to the function.

E.g.: `DTYPE(functionSignature, stackX, stackY ...)`
- `stackX` stack position where the 1st input of the function lives
- `stackY` stack position where the 2nd input of the function lives

TBD: 
- `DTYPE(dTypeRegAddress, functionSignature, stackX, stackY ...)` - a `bytes20` argument may also be needed, for specifying the Ethereum address of the dType registry. 
- can we have a variable number of arguments for an opcode? (flexibility, the need to only make one general precompile)

The dType registry functions will be available as a precompile. `functionSignature` will have the same value in the precompile, as the function signature from the on-chain smart contracts.

Example of functions that can be called through `DTYPE`:
- registry functions: `count()`, `isType(identifier)`, `getTypeHash(lang, name)`, `getType(identifier)`
- storage contract functions: `count()`, `getByHash(itemIdentifier)`, isStored(itemIdentifier) `getItemHash()`

The precompile will have access to a type's storage contract - each type registers the Ethereum address of its storage contract in the registry. An example for calling `StorageContract.isStored(itemIdentifier)` would be:
```
DTYPE('0x3f42aeab', dTypeIdentifier, itemIdentifier)
```

### dType Trie

The Storage Trie for each smart contract account is now implemented as a `key => value` store in leveldb, where the `key` represents the storage location and the `value` is the RLP encoded value.

E.g.: for retrieving the value stored in a mapping, at a specific mapping `map_key`, we can use `getStorageAt(address, keccack(LeftPad32(map_key, 0), LeftPad32(map_position, 0)), block)`. The storage location is defined by `keccack(LeftPad32(map_key, 0), LeftPad32(map_position, 0))`.

For the `DTYPE` opcode, this means touching the Storage Trie for several accounts (dType Registry, item storage contracts, type definition libraries).

We are therefore proposing an optimization: adding a dType Trie (sparse Merkle tree, in case of Ethereum 2.0), from which the dType precompile will retrieve data.

The database implementation will also be a `key => value` store.

- `key` for dType registry:
```
getdTypeAt(keccack(
    LeftPad32(dtype_map_key, 0),
    LeftPad32(dtype_map_position, 0)
))
```
TBD: if an `address` should also be provided.

- `key` for data items:
```
getdTypeAt(keccack(
    LeftPad32(dtype_storage_map_key, 0),
    LeftPad32(dtype_storage_map_position, 0),
    LeftPad32(dtype_map_position, 0)
))
```

## Rationale


## Backwards Compatibility

This proposal adds a new opcode and does not modify the behavior of other opcodes. It is backwards compatible for old contracts that do not use the new opcode and are not called via the new opcode.

## Test Cases

Will be added.

## Implementation

Will be added.
