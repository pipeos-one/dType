const UTILS = require('../test/utils.js');

const dType = artifacts.require("dType.sol");
const Alias = artifacts.require('Alias');
const MarkdownLib = artifacts.require('MarkdownLib');
const MarkdownStorage = artifacts.require('MarkdownStorage');
const AccountLib = artifacts.require('AccountLib');
const AccountStorage = artifacts.require('AccountStorage');
const PersonLib = artifacts.require('PersonLib');
const PersonStorage = artifacts.require('PersonStorage');

const dtypesMd = require('../data/dtypes_md.json');
const dtypesAccount = require('../data/dtypes_account.json');
const dtypesPerson = require('../data/dtypes_person.json');
const mddata = require('../data/md_data.json');
const accountdata = require('../data/account_data.json');
const persondata = require('../data/person_data.json');

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
};
