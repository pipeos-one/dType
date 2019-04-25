const dType = artifacts.require("dType");
const VoteResourceTypeLib = artifacts.require('VoteResourceTypeLib.sol');
const VoteResourceTypeStorage = artifacts.require('VoteResourceTypeStorage.sol');
const VotingFunctions = artifacts.require('VotingFunctions.sol');

module.exports = async function(deployer, network, accounts) {
    await deployer.deploy(VoteResourceTypeLib);
    await deployer.link(VoteResourceTypeLib, VoteResourceTypeStorage);
    await deployer.deploy(VoteResourceTypeStorage);
    await deployer.deploy(VotingFunctions);

    let dtypeContract = await dType.deployed();
    let resourceStorage = await VoteResourceTypeStorage.deployed();
    let votingfunc = await VotingFunctions.deployed();
};
