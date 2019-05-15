const CT = require('./constants.js');
const UTILS = require('./utils.js');

const dType = artifacts.require('dType.sol');
const FileTypeStorage = artifacts.require('FileTypeStorage.sol');
const ActionContract = artifacts.require('ActionContract.sol');
const PermissionStorage = artifacts.require('PermissionStorage.sol');

contract('filesystem', async (accounts) => {
    let dtype, fileStorage, action, permStorage;

    it('deploy', async () => {
        dtype = await dType.deployed();
        fileStorage = await FileTypeStorage.deployed();
        action = await ActionContract.deployed();
        permStorage = await PermissionStorage.deployed();
    });

    it('test permission', async () => {
        let usersPerm, permIdentifier;
        let usersHash = await fileStorage.typeIndex(6);
        let usersFolder = await fileStorage.getByHash(usersHash);
        assert.equal(usersFolder.pointer.name, 'Users');

        usersPerm = await permStorage.get([
            fileStorage.address,
            UTILS.getSignature(fileStorage.abi, 'insert'),
            CT.EMPTY_BYTES,
            usersHash,
        ]);
        assert.isOk(usersPerm.anyone);

        let file = Object.assign({}, CT.EMPTY_FS);
        file.pointer.name = 'AA';
        file.pointer.swarm.filehash = web3.utils.randomHex(32);
        file.parentKey = usersHash;
        let encodedParams = web3.eth.abi.encodeParameters(
            fileStorage.abi.find(fabi => fabi.name === 'insert').inputs,
            [file],
        );

        let fileCount = await fileStorage.count();

        await action.run(
            fileStorage.address,
            UTILS.getSignature(fileStorage.abi, 'insert'),
            encodedParams,
            {from: accounts[3]}
        );

        assert.equal(
            (await fileStorage.count()).toString(),
            fileCount.add(web3.utils.toBN('1')).toString(),
            'wrong resourceCount',
        );

        // A permission should have automatically
        let insertedPerm = await permStorage.get([
            fileStorage.address,
            UTILS.getSignature(fileStorage.abi, 'insert'),
            CT.EMPTY_BYTES,
            await fileStorage.typeIndex(fileCount),
        ]);
        assert.equal(insertedPerm.allowed, accounts[3], 'wrong permission address');
    });
});
