const CT = require('../test/constants.js');
const UTILS = require('../test/utils.js');

const dType = artifacts.require("dType");
const VoteResourceTypeLib = artifacts.require('VoteResourceTypeLib.sol');
const VoteResourceTypeStorage = artifacts.require('VoteResourceTypeStorage.sol');
const VotingFunctions = artifacts.require('VotingFunctions.sol');
const VotingMechanismLib = artifacts.require('VotingMechanismTypeLib.sol');
const VotingMechanismStorage = artifacts.require('VotingMechanismTypeStorage.sol');
const VotingProcessLib = artifacts.require('VotingProcessLib.sol');
const VotingProcessStorage = artifacts.require('VotingProcessStorage.sol');

const PermissionFunctionLib = artifacts.require('PermissionFunctionLib.sol');
const PermissionFunctionStorage = artifacts.require('PermissionFunctionStorage.sol');

const ActionContract = artifacts.require('ActionContract.sol');

const dtypesGov = require('../data/dtypes_gov.json');
const dtypesComposed = require('../data/dtypes_gov_composed.json');
const votingmData = require('../data/votingm_data.json');

module.exports = async function(deployer, network, accounts) {
    await deployer.deploy(VoteResourceTypeLib);
    await deployer.link(VoteResourceTypeLib, VoteResourceTypeStorage);
    await deployer.deploy(VoteResourceTypeStorage);
    await deployer.deploy(VotingFunctions);

    await deployer.deploy(VotingMechanismLib);
    await deployer.link(VotingMechanismLib, VotingMechanismStorage);
    await deployer.deploy(VotingMechanismStorage);

    await deployer.deploy(VotingProcessLib);
    await deployer.link(VotingProcessLib, VotingProcessStorage);
    await deployer.deploy(VotingProcessStorage);

    await deployer.deploy(PermissionFunctionLib);
    await deployer.link(PermissionFunctionLib, PermissionFunctionStorage);
    await deployer.deploy(PermissionFunctionStorage);

    await deployer.deploy(ActionContract, dType.address, PermissionFunctionStorage.address, VoteResourceTypeStorage.address, VotingProcessStorage.address, VotingMechanismStorage.address);

    let dtypeContract = await dType.deployed();
    let resourceStorage = await VoteResourceTypeStorage.deployed();
    let votingfunc = await VotingFunctions.deployed();
    let vmStorage = await VotingMechanismStorage.deployed();
    let vpStorage = await VotingProcessStorage.deployed();
    let fPermission = await PermissionFunctionStorage.deployed();

    // Insert base types
    for (let i = 0; i < dtypesGov.length; i++) {
        let data = dtypesGov[i];
        switch(data.name) {
            case "VoteResource":
                data.contractAddress = resourceStorage.address;
                break;
            case "VotingMechanism":
                data.contractAddress = vmStorage.address;
                break;
        }
        await dtypeContract.insert(data);
    }

    // Insert pure functions
    for (let i = 0; i < dtypesComposed.length; i++) {
        dtypesComposed[i].contractAddress = votingfunc.address;
        await dtypeContract.insert(dtypesComposed[i]);
    }

    // Insert voting mechanisms
    for (let i = 0; i < votingmData.length; i++) {
        let data = votingmData[i];
        for (let j = 0; j < data.processVoteFunctions.length; j++) {
            data.processVoteFunctions[j] = await dtypeContract.getTypeHash(0, data.processVoteFunctions[j]);
        }
        for (let j = 0; j < data.processStateFunctions.length; j++) {
            data.processStateFunctions[j] = await dtypeContract.getTypeHash(0, data.processStateFunctions[j]);
        }
        await vmStorage.insert(data);
    }

    // Insert voting process for permission
    await vpStorage.insert({
        contractAddress: fPermission.address,
        funcHash: UTILS.getSignature(fPermission.abi, 'insert'),
        votingMechanismDataHash: await vmStorage.typeIndex(0),
        funcHashYes: UTILS.getSignature(fPermission.abi, 'accept'),
        funcHashNo: UTILS.getSignature(fPermission.abi, 'dismiss'),
    });

    // Insert permission for adding permissions
    await fPermission.insert({
        contractAddress: fPermission.address,
        functionSig: UTILS.getSignature(fPermission.abi, 'insert'),
        anyone: false,
        allowed: CT.EMPTY_ADDRESS,
        temporaryAction: UTILS.getSignature(fPermission.abi, 'insertReview'),
        votingProcessDataHash: await vpStorage.typeIndex(0),
    });
    // Enable permission
    let permHash = await fPermission.typeIndex(0);
};
