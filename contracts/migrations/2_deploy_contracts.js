const dType = artifacts.require("dType");
const testUtils = artifacts.require('TestUtils.sol');
const TypeStorage = artifacts.require('TypeStorage.sol');

const dtypes = require('../data/dtypes_test.json');

module.exports = async function(deployer, network, accounts) {
    await deployer.deploy(dType);

    if (network == 'development') {
        await deployer.deploy(testUtils);
        await deployer.deploy(TypeStorage);
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
