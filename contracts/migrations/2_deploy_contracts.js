const dType = artifacts.require("dType");
const testUtils = artifacts.require('TestUtils.sol');
const typeAContract = artifacts.require('typeAContract.sol')
const typeBContract = artifacts.require('typeBContract.sol')
const typeABLogic = artifacts.require('typeABLogic.sol')

const dtypesBase = require('../data/dtypes_test.json');
const dtypesComposed = require('../data/dtypes_composed.json');
const dtypesCore = require('../data/dtypes_core.json');

module.exports = async function(deployer, network, accounts) {
    await deployer.deploy(dType);
    await deployer.deploy(typeAContract);
    await deployer.deploy(typeBContract);
    await deployer.deploy(typeABLogic);

    let dtypeContract = await dType.deployed();
    let typeA = await typeAContract.deployed();
    let typeB = await typeBContract.deployed();
    let typeAB = await typeABLogic.deployed();

    for (let i = 0; i < dtypesBase.length; i++) {
        let tx = await dtypeContract.insert(dtypesBase[i], {from: accounts[0]});
    }

    for (let i = 0; i < dtypesCore.length; i++) {
        let tx = await dtypeContract.insert(dtypesCore[i], {from: accounts[0]});
    }

    for (let i = 0; i < dtypesComposed.length; i++) {
        switch (dtypesComposed[i].name) {
            case 'TypeA':
                dtypesComposed[i].contractAddress = typeA.address;
            case 'TypeB':
                dtypesComposed[i].contractAddress = typeB.address;
            case 'setStaked':
                dtypesComposed[i].contractAddress = typeAB.address;
        }
        let tx = await dtypeContract.insert(dtypesComposed[i], {from: accounts[0]});
    }

    if (network == 'development') {
        await deployer.deploy(testUtils);
    }
};
