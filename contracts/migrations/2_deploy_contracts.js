const dType = artifacts.require("dType");
const testUtils = artifacts.require('TestUtils.sol');

module.exports = async function(deployer, network) {
    await deployer.deploy(dType);

    if (network == 'development') {
        await deployer.deploy(testUtils);
    }
};
