const dType = artifacts.require("dType");
const VoteResourceTypeLib = artifacts.require('VoteResourceTypeLib.sol');
const VoteResourceTypeStorage = artifacts.require('VoteResourceTypeStorage.sol');
const VotingFunctions = artifacts.require('VotingFunctions.sol');

const dtypesGov = require('../data/dtypes_gov.json');
const dtypesComposed = require('../data/dtypes_gov_composed.json');

module.exports = async function(deployer, network, accounts) {
    await deployer.deploy(VoteResourceTypeLib);
    await deployer.link(VoteResourceTypeLib, VoteResourceTypeStorage);
    await deployer.deploy(VoteResourceTypeStorage);
    await deployer.deploy(VotingFunctions);

    let dtypeContract = await dType.deployed();
    let resourceStorage = await VoteResourceTypeStorage.deployed();
    let votingfunc = await VotingFunctions.deployed();

    // Insert base types
    dtypesGov.forEach(async (data) => {
        switch(data.name) {
            case "VoteResource":
                data.contractAddress = resourceStorage.address;
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
