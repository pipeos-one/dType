const dType = artifacts.require("dType");

module.exports = async function(deployer, network) {
    await deployer.deploy(dType);
};
