const CT = require('./constants.js');
const UTILS = require('./utils.js');

const dType = artifacts.require('dType.sol');
const FileTypeStorage = artifacts.require('FileTypeStorage.sol');
const ActionContract = artifacts.require('ActionContract.sol');

contract('filesystem', async (accounts) => {
    let dtype, fileStorage, action;

    it('deploy', async () => {
        dtype = await dType.deployed();
        fileStorage = await FileTypeStorage.deployed();
        action = await ActionContract.deployed();
    });

    it('test permission', async () => {
        let file = Object.assign({}, CT.EMPTY_FS);
        file.pointer.name = 'AA';
        file.pointer.swarm.filehash = web3.utils.randomHex(32);
        let encodedParams = web3.eth.abi.encodeParameters(
            fileStorage.abi.find(fabi => fabi.name === 'insert').inputs,
            [file],
        );

        await action.run(
            fileStorage.address,
            UTILS.getSignature(fileStorage.abi, 'insert'),
            encodedParams,
            {from: accounts[3]}
        );
    });
});
