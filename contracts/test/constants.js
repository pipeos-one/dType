const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';
const EMPTY_BYTES = '0x0000000000000000000000000000000000000000000000000000000000000000';
const EMPTY_BYTES4 = '0x00000000';

const EMPTY_PERMISSION = {
    contractAddress: EMPTY_ADDRESS,
    functionSig: EMPTY_BYTES4,
    transitionHash: EMPTY_BYTES,
    dataHash: EMPTY_BYTES,
    anyone: false,
    allowed: EMPTY_ADDRESS,
    permissionProcess: {
        temporaryAction: EMPTY_BYTES4,
        votingProcessDataHash: EMPTY_BYTES,
        functionHashPermission: EMPTY_BYTES,
        allowedTransitions: [],
    }
};

const EMPTY_FS = {
    pointer: {
        name: '',
        extension: 0,
        swarm: {
            protocol: 1,
            filehash: EMPTY_BYTES
        },
        ipfs: {
            protocol: 0,
            filehash: EMPTY_BYTES
        },
        uri: {
            uri: ''
        },
    },
    parentKey: EMPTY_BYTES,
    filesPerFolder: []
}

module.exports = {
    EMPTY_ADDRESS,
    EMPTY_BYTES,
    EMPTY_BYTES4,
    EMPTY_PERMISSION,
    EMPTY_FS,
}
