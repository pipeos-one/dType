const dType = artifacts.require("dType");
const FSBaseTypeLib = artifacts.require('FSBaseTypeLib.sol');
const FolderTypeLib = artifacts.require('FolderTypeLib.sol');
const FileTypeStorage = artifacts.require('FileTypeStorage.sol');
const FolderTypeStorage = artifacts.require('FolderTypeStorage.sol');

const dtypesFS = require('../data/dtypes_fs.json');

module.exports = async function(deployer, network, accounts) {
    await deployer.deploy(FSBaseTypeLib);
    await deployer.link(FSBaseTypeLib, FileTypeStorage);
    await deployer.deploy(FileTypeStorage);

    await deployer.deploy(FolderTypeLib);
    await deployer.link(FolderTypeLib, FolderTypeStorage);
    await deployer.deploy(FolderTypeStorage);

    let dtypeContract = await dType.deployed();
    let fileType = await FileTypeStorage.deployed();
    let folderType = await FolderTypeStorage.deployed();

    for (let i = 0; i < dtypesFS.length; i++) {
        let tx = await dtypeContract.insert(dtypesFS[i], {from: accounts[0]});
    }
};
