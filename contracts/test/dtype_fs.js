const dType = artifacts.require('dType.sol');
const FileTypeLib = artifacts.require('FileTypeLib.sol');
const FileTypeStorage = artifacts.require('FileTypeStorage.sol');
const FSPureFunctions = artifacts.require('FSPureFunctions.sol');

const fsData = require('../data/fs_data.json');

contract('filesystem', async (accounts) => {
    let dtype, fileLib, fileStorage, fileFunctions;

    it('deploy', async () => {
        dtype = await dType.deployed();
        fileLib = await FileTypeLib.deployed();
        fileStorage = await FileTypeStorage.deployed();
        fileFunctions = await FSPureFunctions.deployed();
    });

    it('check data', async () => {
        let index = 0;
        for (let i = 0; i < fsData.folders.length; i++) {
            folder = fsData.folders[i];
            index += i;

            let folderStruct = await fileStorage.getByHash(await fileStorage.typeIndex(index));
            assert.equal(folderStruct.filesPerFolder.length, folder.files.length, 'wrong length for filesPerFolder');

            index += folder.files.length ? folder.files.length - 1 : 0;
        }
    });

    it('changeName', async () => {
        let logs, folderHash, fileHash;
        let changedFile;
        let file = {
            "name": "TestFile",
            "extension": 1,
            "source": "/bzz-raw:/9098281bbfb81d161a71c27bae34add67e9fa9f6eb84f22c0c9aedd7b9cd2189/",
            "parentKey": null,
            filesPerFolder: []
        };
        let folder = {
            "name": "TestFolder",
            "extension": 0,
            "source": "/bzz-raw:/9098281bbfb81d161a71c27bae34add67e9fa9f6eb84f22c0c9aedd7b9cd2189/",
            "parentKey": "0x00",
            filesPerFolder: []
        };
        ({logs} = await fileStorage.insert(folder));
        folderHash = logs[0].args.hash;

        file.parentKey = folderHash;
        ({logs} = await fileStorage.insert(file));
        fileHash = logs[0].args.hash;

        let insertedFile = await fileStorage.getByHash(fileHash);
        assert.equal(file.name, insertedFile.name, 'insertedFile.name incorrect');
        assert.equal(file.extension, insertedFile.extension, 'insertedFile.extension incorrect');
        assert.equal(file.source, insertedFile.source, 'insertedFile.source incorrect');
        assert.equal(file.parentKey, insertedFile.parentKey, 'insertedFile.parentKey incorrect');

        ({logs} = await fileStorage.setFiles(folderHash, [fileHash]));

        // Test standalone changeName
        changedFile = await fileFunctions.contract.methods.changeName(file).call();
        assert.equal(file.name + '1', changedFile.name);
        assert.equal(file.extension, changedFile.extension);
        assert.equal(file.source, changedFile.source);
        assert.equal(file.parentKey, changedFile.parentKey);

        let funcHash = await dtype.getTypeHash(0, 'changeName');

        ({logs} = await dtype.run(funcHash, [fileHash]));

        changedFile = await fileStorage.getByHash(logs[0].args.hash);
        assert.equal(file.name + '1', changedFile.name, 'changedFile.name incorrect');
        assert.equal(file.extension, changedFile.extension);
        assert.equal(file.source, changedFile.source);
        assert.equal(file.parentKey, changedFile.parentKey);
    });
});
