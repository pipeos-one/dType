const CT = require('./constants.js');

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
            "pointer": {
                "name": "TestFile",
                "extension": 1,
                "swarm": {
                    "protocol": 1,
                    "filehash": "0x9098281bbfb81d161a71c27bae34add67e9fa9f6eb84f22c0c9aedd7b9cd2189"
                },
                "ipfs": {"protocol": 0, "filehash": "0x0000000000000000000000000000000000000000000000000000000000000000"}, "uri": {"uri": ""}
            },
            filesPerFolder: []
        };
        let folder = {
            "pointer": {
                "name": "TestFolder",
                "extension": 0,
                "swarm": {
                    "protocol": 1,
                    "filehash": "0x9098281bbfb81d161a71c27bae34add67e9fa9f6eb84f22c0c9aedd7b9cd2189"
                },
                "ipfs": {"protocol": 0, "filehash": "0x0000000000000000000000000000000000000000000000000000000000000000"}, "uri": {"uri": ""}
            },
            "parentKey": "0x00",
            filesPerFolder: []
        };
        ({logs} = await fileStorage.insert(folder));
        folderHash = logs[0].args.hash;

        file.parentKey = folderHash;
        ({logs} = await fileStorage.insert(file));
        fileHash = logs[0].args.hash;

        let insertedFile = await fileStorage.getByHash(fileHash);
        assert.equal(file.pointer.name, insertedFile.pointer.name, 'insertedFile.name incorrect');
        assert.equal(file.pointer.extension, insertedFile.pointer.extension, 'insertedFile.extension incorrect');
        assert.equal(file.pointer.swarm.protocol, insertedFile.pointer.swarm.protocol, 'insertedFile.swarm incorrect');
        assert.equal(file.pointer.swarm.filehash, insertedFile.pointer.swarm.filehash, 'insertedFile.filehash incorrect');
        assert.equal(file.parentKey, insertedFile.parentKey, 'insertedFile.parentKey incorrect');

        ({logs} = await fileStorage.setFiles(folderHash, [fileHash]));
    });
});
