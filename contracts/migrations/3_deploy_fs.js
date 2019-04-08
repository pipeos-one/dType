const dType = artifacts.require("dType");
const FileTypeLib = artifacts.require('FileTypeLib.sol');
const FileTypeStorage = artifacts.require('FileTypeStorage.sol');
const FSPureFunctions = artifacts.require('FSPureFunctions.sol');

const dtypesFS = require('../data/dtypes_fs.json');
const dtypesComposed = require('../data/dtypes_fs_composed.json');
const fsData = require('../data/fs_data.json');

module.exports = async function(deployer, network, accounts) {
    await deployer.deploy(FileTypeLib);
    await deployer.link(FileTypeLib, FileTypeStorage);
    await deployer.deploy(FileTypeStorage);

    await deployer.link(FileTypeLib, FSPureFunctions);
    await deployer.deploy(FSPureFunctions);

    let dtypeContract = await dType.deployed();
    let fileStorage = await FileTypeStorage.deployed();
    let fsFunctions = await FSPureFunctions.deployed();

    // Insert base FS types
    dtypesFS[0].contractAddress = fileStorage.address;
    await dtypeContract.insert(dtypesFS[0], {from: accounts[0]});

    // Insert pure functions
    dtypesComposed.forEach(async (data) => {
        data.contractAddress = fsFunctions.address;
        await dtypeContract.insert(data);

        let typeHash = await dtypeContract.getTypeHash(data.lang, data.name);
        await dtypeContract.setOptionals(typeHash, data.outputs);
    });

    // Insert example data records in storage contracts
    for (folderData of fsData.folders) {
        let {folder, files} = folderData;
        let fileKeys = [];

        if (typeof folder.parentKey == 'number') {
            folder.parentKey = await fileStorage.typeIndex(folder.parentKey);
        } else {
            folder.parentKey = "0x00";
        }

        // Insert folder data
        ({logs} = await fileStorage.insert(folder));
        ({hash} = logs[0].args);

        // Insert files
        for (file of files) {
            file.parentKey = hash;
            let {logs} = await fileStorage.insert(file);
            fileKeys.push(logs[0].args.hash);
        }

        // Set file keys in each folder
        await fileStorage.setOptionals(hash, fileKeys);
    }
};
