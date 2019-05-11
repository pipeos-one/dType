const CT = require('../test/constants.js');
const UTILS = require('../test/utils.js');

const dType = artifacts.require("dType");
const PermissionStorage = artifacts.require('PermissionStorage.sol');
const FileTypeStorage = artifacts.require('FileTypeStorage.sol');
const VotingProcessStorage = artifacts.require('VotingProcessStorage.sol');
const ActionContract = artifacts.require('ActionContract.sol');

module.exports = async function(deployer, network, accounts) {
    let dtypeContract = await dType.deployed();
    let permStorage = await PermissionStorage.deployed();
    let fileStorage = await FileTypeStorage.deployed();
    let vpStorage = await VotingProcessStorage.deployed();
    let action = await ActionContract.deployed();
    let fsPermission, insertPermissionKeys, updatePermissionKeys, tPermission;

    let allowedTransitions = [
        await dtypeContract.getTypeHash(0, 'structureData'),
        await dtypeContract.getTypeHash(0, 'getChangedFile'),
        await dtypeContract.getTypeHash(0, 'changeFileName'),
        await dtypeContract.getTypeHash(0, 'changeFileParent'),
        await dtypeContract.getTypeHash(0, 'addFolderFile'),
        await dtypeContract.getTypeHash(0, 'removeFolderFile'),
        await dtypeContract.getTypeHash(0, 'changeFolderFiles'),
    ];
    insertPermissionKeys = await dtypeContract.getTypeHash(0, 'getInsertPermissionKeys');
    updatePermissionKeys = await dtypeContract.getTypeHash(0, 'getUpdatePermissionKeys');

    // Insert general permission for inserting files & folders
    fsPermission = {
        contractAddress: fileStorage.address,
        functionSig: UTILS.getSignature(fileStorage.abi, 'insert'),
        transitionHash: CT.EMPTY_BYTES,
        dataHash: CT.EMPTY_BYTES,
        anyone: false,
        allowed: CT.EMPTY_ADDRESS,
        permissionProcess: {
            temporaryAction: UTILS.getSignature(fileStorage.abi, 'insertReview'),
            votingProcessDataHash: await vpStorage.typeIndex(0),
            functionHashPermission: insertPermissionKeys,
            allowedTransitions,
        }
    }
    await permStorage.insert(fsPermission);

    // Insert general permission for updating files & folders
    fsPermission.functionSig = UTILS.getSignature(fileStorage.abi, 'update');
    fsPermission.permissionProcess.temporaryAction = UTILS.getSignature(fileStorage.abi, 'updateReview');
    fsPermission.permissionProcess.functionHashPermission = updatePermissionKeys;

    await permStorage.insert(fsPermission);

    // Insert permissions for helper transitions, without consequence
    // structureData
    tPermission = Object.assign(CT.EMPTY_PERMISSION, {
        contractAddress: fileStorage.address,
        functionSig: UTILS.getSignature(fileStorage.abi, 'update'),
        transitionHash: allowedTransitions[0],
        anyone: true,
    });
    await permStorage.insert(tPermission);
    tPermission.functionSig =  UTILS.getSignature(fileStorage.abi, 'insert');
    await permStorage.insert(tPermission);

    // getChangedFile
    tPermission.transitionHash = allowedTransitions[1];
    await permStorage.insert(tPermission);
    tPermission.functionSig =  UTILS.getSignature(fileStorage.abi, 'update');
    await permStorage.insert(tPermission);
};
