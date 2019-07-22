pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import './MarkdownLib.sol';

library MarkdownLib {

    struct Markdown {
        string content;
    }

    function insert(Markdown storage self, Markdown memory instance) internal {
        self.content = instance.content;
    }

    function getDataHash(Markdown memory instance) pure public returns(bytes32 hash) {
        return keccak256(abi.encode(instance.content));
    }

    function structureBytes(bytes memory data)
        pure
        public
        returns(Markdown memory instance)
    {
        (instance) = abi.decode(data, (Markdown));
    }

    function destructureBytes(Markdown memory instance)
        pure
        public
        returns(bytes memory data)
    {
        return abi.encode(instance);
    }
}
