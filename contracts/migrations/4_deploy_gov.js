const dType = artifacts.require("dType");
const VoteResourceTypeLib = artifacts.require('VoteResourceTypeLib.sol');
const VoteResourceTypeStorage = artifacts.require('VoteResourceTypeStorage.sol');
const VotingFunctions = artifacts.require('VotingFunctions.sol');
const VotingMechanismLib = artifacts.require('VotingMechanismTypeLib.sol');
const VotingMechanismStorage = artifacts.require('VotingMechanismTypeStorage.sol');
const VotingProcessLib = artifacts.require('VotingProcessLib.sol');
const VotingProcessStorage = artifacts.require('VotingProcessStorage.sol');


const dtypesGov = require('../data/dtypes_gov.json');
const dtypesComposed = require('../data/dtypes_gov_composed.json');

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

    let dtypeContract = await dType.deployed();
    let resourceStorage = await VoteResourceTypeStorage.deployed();
    let votingfunc = await VotingFunctions.deployed();
    let vmStorage = await VotingMechanismStorage.deployed();
    let vpStorage = await VotingProcessStorage.deployed();

    // Insert base types
    dtypesGov.forEach(async (data) => {
        switch(data.name) {
            case "VoteResource":
                data.contractAddress = resourceStorage.address;
                break;
            case "VotingMechanism":
                data.contractAddress = vmStorage.address;
                break;
        }
        await dtypeContract.insert(data);
    });

    // Insert pure functions
    dtypesComposed.forEach(async (data) => {
        data.contractAddress = votingfunc.address;
        await dtypeContract.insert(data);
    });
};
