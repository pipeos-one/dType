const UTILS = require('../test/utils.js');

const dType = artifacts.require("dType.sol");
const Alias = artifacts.require('Alias');
const MarkdownLib = artifacts.require('MarkdownLib');
const MarkdownStorage = artifacts.require('MarkdownStorage');
const AccountLib = artifacts.require('AccountLib');
const AccountStorage = artifacts.require('AccountStorage');
const PersonLib = artifacts.require('PersonLib');
const PersonStorage = artifacts.require('PersonStorage');
const PhysicalAddressLib = artifacts.require('PhysicalAddressLib');
const PhysicalAddressStorage = artifacts.require('PhysicalAddressStorage');

module.exports = async function(deployer, network, accounts) {
    const chainId = await web3.eth.net.getId();

    await deployer.deploy(Alias, dType.address, chainId);

    await deployer.deploy(MarkdownLib);
    await deployer.link(MarkdownLib, MarkdownStorage);
    await deployer.deploy(MarkdownStorage);

    await deployer.deploy(AccountLib);
    await deployer.link(AccountLib, AccountStorage);
    await deployer.deploy(AccountStorage);

    await deployer.deploy(PersonLib);
    await deployer.link(PersonLib, PersonStorage);
    await deployer.deploy(PersonStorage);

    await deployer.deploy(PhysicalAddressLib);
    await deployer.link(PhysicalAddressLib, PhysicalAddressStorage);
    await deployer.deploy(PhysicalAddressStorage);
};
