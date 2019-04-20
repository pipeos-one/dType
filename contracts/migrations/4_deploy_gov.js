const dType = artifacts.require("dType");
const VotingMechanismLib = artifacts.require('VotingMechanismLib.sol');
const VotingMechanismStorage = artifacts.require('VotingMechanismStorage.sol');

const dtypesGov = require('../data/dtypes_gov.json');

module.exports = async function(deployer, network, accounts) {
    await deployer.deploy(VotingMechanismLib);
    await deployer.link(VotingMechanismLib, VotingMechanismStorage);
    await deployer.deploy(VotingMechanismStorage);

    let dtypeContract = await dType.deployed();
    let vmStorage = await VotingMechanismStorage.deployed();

    // Insert base FS types
    dtypesGov.forEach(async (data) => {
        switch(data.name) {
            case "VotingMechanism":
                data.contractAddress = vmStorage.address;
                break;
        }
        await dtypeContract.insert(data);
    });
};
