const dType = artifacts.require("dType");
const testUtils = artifacts.require('TestUtils.sol');
const typeAContract = artifacts.require('typeAContract.sol')
const typeBContract = artifacts.require('typeBContract.sol')
const typeABLogic = artifacts.require('typeABLogic.sol')

const dtypes = require('../data/dtypes_test.json');

module.exports = async function(deployer, network, accounts) {
    await deployer.deploy(dType);

    if (network == 'development') {
        await deployer.deploy(testUtils);
        await deployer.deploy(typeAContract);
        await deployer.deploy(typeBContract);
        await deployer.deploy(typeABLogic);
    } else {
        let dtypeContract = await dType.deployed();

        for (let i = 0; i < dtypes.length; i++) {
            let {
                name,
                types,
                lang,
                isEvent,
                isFunction,
                hasOutput,
                contractAddress,
                source,
            } = dtypes[i];
            console.log(`insert ${name}`);
            let tx = await dtypeContract.insert(
                lang, name, types, isEvent, isFunction, hasOutput, contractAddress, source,
                {from: accounts[0]}
            );
        }
    }
};
