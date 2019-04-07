pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import './ExtensionLib.sol';

library FSBaseTypeLib {

    struct FSBaseType {
        string name;
        ExtensionLib.Extension extension;
        string source;  // swarm/ipfs url; will be a type in itself
        bytes32 parentKey;  // string path
    }

    function structureBytes(bytes memory data)
        pure
        public
        returns(FSBaseType memory fsbase)
    {
        (fsbase) = abi.decode(data, (FSBaseType));
    }

    function destructureBytes(FSBaseType memory fsbase)
        pure
        public
        returns(bytes memory data)
    {
        return abi.encode(fsbase);
    }

    function map(
        address callbackAddr,
        bytes4 callbackSig,
        FSBaseType[] memory fsbaseAarr
    )
        view
        public
        returns (FSBaseType[] memory result)
    {
        uint length = fsbaseAarr.length;
        result = new FSBaseType[](length);

        for (uint i = 0; i < length; i++) {
            (bool success, bytes memory data) = callbackAddr.staticcall(abi.encodeWithSelector(callbackSig, fsbaseAarr[i]));

            require(success, "Map callback failed");
            result[i] = structureBytes(data);
        }

        return result;
    }
}
