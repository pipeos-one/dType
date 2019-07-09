const dTypeLib = artifacts.require('dTypeLib.sol');
const dType = artifacts.require("dType.sol");
const testUtils = artifacts.require('TestUtils.sol');
const typeALib = artifacts.require('typeALib.sol');
const typeAContract = artifacts.require('typeAContract.sol');
const typeBContract = artifacts.require('typeBContract.sol');
const typeABLogic = artifacts.require('typeABLogic.sol');
const typeAAFunctions = artifacts.require('typeAAFunctions');
const alias = artifacts.require('Alias');

const dtypesBase = require('../data/dtypes_test.json');
const dtypesComposed = require('../data/dtypes_composed.json');
const dtypesCore = require('../data/dtypes_core.json');

module.exports = async function(deployer, network, accounts) {
    await deployer.deploy(dTypeLib);
    await deployer.link(dTypeLib, dType);
    await deployer.deploy(dType);
    await deployer.deploy(typeALib);
    await deployer.link(typeALib, typeAContract);
    await deployer.deploy(typeAContract);
    await deployer.deploy(typeBContract);
    await deployer.deploy(typeABLogic);
    await deployer.link(typeALib, typeAAFunctions);
    await deployer.deploy(typeAAFunctions);
    await deployer.deploy(alias);

    let dtypeContract = await dType.deployed();
    let typeA = await typeAContract.deployed();
    let typeB = await typeBContract.deployed();
    let typeAB = await typeABLogic.deployed();
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
            case 'doubleBalances':
                dtypesComposed[i].contractAddress = typeAAF.address;
                break;
            case 'double':
                dtypesComposed[i].contractAddress = typeAAF.address;
                break;
        }
        let tx = await dtypeContract.insert(dtypesComposed[i], {from: accounts[0]});
    }

    if (network == 'development') {
        await deployer.deploy(testUtils);
    }
};
