pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

library FolderTypeLib {

    struct FolderType {
        bytes32 fsBaseHash;
        bytes32[] fileKeys;  // children keys
    }

    function structureBytes(bytes memory data)
        pure
        public
        returns(FolderType memory fsFolder)
    {
        (fsFolder) = abi.decode(data, (FolderType));
    }

    function destructureBytes(FolderType memory fsFolder)
        pure
        public
        returns(bytes memory data)
    {
        return abi.encode(fsFolder);
    }

    function map(
        address callbackAddr,
        bytes4 callbackSig,
        FolderType[] memory fsFolderAarr
    )
        view
        public
        returns (FolderType[] memory result)
    {
        uint length = fsFolderAarr.length;
        result = new FolderType[](length);

        for (uint i = 0; i < length; i++) {
            (bool success, bytes memory data) = callbackAddr.staticcall(abi.encodeWithSelector(callbackSig, fsFolderAarr[i]));

            require(success, "Map callback failed");
            result[i] = structureBytes(data);
        }

        return result;
    }
}
