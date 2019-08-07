/* eslint-disable */

export const StorageBase = {
  "contractName": "StorageBase",
  "abi": [
    {
      "constant": true,
      "inputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "typeIndex",
      "outputs": [
        {
          "name": "",
          "type": "bytes32"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "hash",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "name": "index",
          "type": "uint256"
        }
      ],
      "name": "LogNew",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "hash",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "name": "index",
          "type": "uint256"
        }
      ],
      "name": "LogUpdate",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "hash",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "name": "index",
          "type": "uint256"
        }
      ],
      "name": "LogRemove",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "hash",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "name": "proponent",
          "type": "address"
        }
      ],
      "name": "LogNewReview",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "hash",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "name": "proponent",
          "type": "address"
        }
      ],
      "name": "LogUpdateReview",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "hash",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "name": "proponent",
          "type": "address"
        }
      ],
      "name": "LogRemoveReview",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "hash",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "name": "proponent",
          "type": "address"
        }
      ],
      "name": "LogAccepted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "name": "hash",
          "type": "bytes32"
        },
        {
          "indexed": true,
          "name": "proponent",
          "type": "address"
        }
      ],
      "name": "LogDismissed",
      "type": "event"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "count",
      "outputs": [
        {
          "name": "counter",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    }
  ],
}
