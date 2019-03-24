const dType = artifacts.require("dType");
const testUtils = artifacts.require('TestUtils.sol');
const typeAContract = artifacts.require('typeAContract.sol');
const typeBContract = artifacts.require('typeBContract.sol');
const typeABLogic = artifacts.require('typeABLogic.sol');
const typeAArrayContract = artifacts.require('typeAArrayContract.sol');
const typeAAFunctions = artifacts.require('typeAAFunctions');

const dtypesBase = require('../data/dtypes_test.json');
const dtypesComposed = require('../data/dtypes_composed.json');
const dtypesCore = require('../data/dtypes_core.json');

module.exports = async function(deployer, network, accounts) {
    await deployer.deploy(dType);
    await deployer.deploy(typeAContract);
    await deployer.deploy(typeBContract);
    await deployer.deploy(typeABLogic);
    await deployer.deploy(typeAArrayContract);
    await deployer.deploy(typeAAFunctions);

    let dtypeContract = await dType.deployed();
    let typeA = await typeAContract.deployed();
    let typeB = await typeBContract.deployed();
    let typeAB = await typeABLogic.deployed();
    let typeAArray = await typeAArrayContract.deployed();
    let typeAAF = await typeAAFunctions.deployed();


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
                break;
            case 'TypeB':
                dtypesComposed[i].contractAddress = typeB.address;
                break;
            case 'setStaked':
                dtypesComposed[i].contractAddress = typeAB.address;
                break;
            case 'TypeA[]':
                dtypesComposed[i].contractAddress = typeAArray.address;
                break;
            case 'doubleBalances':
                dtypesComposed[i].contractAddress = typeAAF.address;
                break;
        }
        let tx = await dtypeContract.insert(dtypesComposed[i], {from: accounts[0]});
        if (dtypesComposed[i].outputs) {
            let typeHash = await dtypeContract.getTypeHash(dtypesComposed[i].lang, dtypesComposed[i].name);
            await dtypeContract.setOutputs(typeHash, dtypesComposed[i].outputs);
        }
    }

    if (network == 'development') {
        await deployer.deploy(testUtils);
    }
};
