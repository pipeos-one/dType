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

    let dtypeContract = await dType.deployed();
    let alias = await Alias.deployed();
    let md = await MarkdownStorage.deployed();
    let account = await AccountStorage.deployed();
    let person = await PersonStorage.deployed();

    // Markdown example with alias
    dtypesMd[0].contractAddress = md.address;
    await dtypeContract.insert(dtypesMd[0], {from: accounts[0]});

    let dtypehashmd = await dtypeContract.getTypeHash(0, 'markdown');
    const signatureDataMd = (hash, nonce, name, sep) => UTILS.signatureDataInternal(web3, chainId, Alias.address, dtypehashmd, hash, nonce, name, sep);
    for (let i = 0; i < mddata.length; i++) {
        const receipt = await md.insert(mddata[i].data);
        const hash = receipt.logs[0].args.hash;
        aliasn = mddata[i].alias;
        aliasn[0] = web3.utils.utf8ToHex(aliasn[0]);
        signature = await web3.eth.sign(
          signatureDataMd(hash, 1, ...aliasn),
          accounts[0],
        );
        await alias.setAlias(dtypehashmd, ...aliasn, hash, signature);
    }

    // Account example with alias
    dtypesAccount[0].contractAddress = account.address;
    await dtypeContract.insert(dtypesAccount[0], {from: accounts[0]});
    let dtypehashacc = await dtypeContract.getTypeHash(0, 'account');
    const signatureDataAcc = (hash, nonce, name, sep) => UTILS.signatureDataInternal(web3, chainId, Alias.address, dtypehashacc, hash, nonce, name, sep);
    for (let i = 0; i < accountdata.length; i++) {
        await account.insert([accountdata[i].data.address]);
        let hash = await account.typeIndex(i);
        aliasn = accountdata[i].alias;
        aliasn[0] = web3.utils.utf8ToHex(aliasn[0]);
        signature = await web3.eth.sign(
          signatureDataAcc(hash, 1, ...aliasn),
          accounts[0],
        );
        await alias.setAlias(dtypehashacc, ...aliasn, hash, signature);
    }

    // Person example with alias
    dtypesPerson[0].contractAddress = person.address;
    await dtypeContract.insert(dtypesPerson[0], {from: accounts[0]});
    let dtypehashper = await dtypeContract.getTypeHash(0, 'person');
    const signatureDataPer = (hash, nonce, name, sep) => UTILS.signatureDataInternal(web3, chainId, Alias.address, dtypehashper, hash, nonce, name, sep);
    for (let i = 0; i < persondata.length; i++) {
        let data = persondata[i].data;
        await person.insert(persondata[i].data);
        let hash = await person.typeIndex(i);
        aliasn = persondata[i].alias;
        aliasn[0] = web3.utils.utf8ToHex(aliasn[0]);
        signature = await web3.eth.sign(
          signatureDataPer(hash, 1, ...aliasn),
          accounts[0],
        );
        await alias.setAlias(dtypehashper, ...aliasn, hash, signature);
    }
};
