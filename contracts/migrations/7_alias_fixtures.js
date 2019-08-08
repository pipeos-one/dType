const UTILS = require('../test/utils.js');

const dType = artifacts.require("dType.sol");
const Alias = artifacts.require('Alias');
const MarkdownStorage = artifacts.require('MarkdownStorage');
const AccountStorage = artifacts.require('AccountStorage');
const PersonStorage = artifacts.require('PersonStorage');
const PhysicalAddressStorage = artifacts.require('PhysicalAddressStorage');

const dtypesMd = require('../data/dtypes_md.json');
const dtypesAccount = require('../data/dtypes_account.json');
const dtypesPerson = require('../data/dtypes_person.json');
const dtypesPhyA = require('../data/dtypes_physicaladdr.json');
const mddata = require('../data/md_data.json');
const accountdata = require('../data/account_data.json');
const persondata = require('../data/person_data.json');
const phyadata = require('../data/physicaladdr_data.json');

module.exports = async function(deployer, network, accounts) {
    const chainId = await web3.eth.net.getId();

    let dtypeContract = await dType.deployed();
    let alias = await Alias.deployed();
    let md = await MarkdownStorage.deployed();
    let account = await AccountStorage.deployed();
    let person = await PersonStorage.deployed();
    let phyaddr = await PhysicalAddressStorage.deployed();

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

    // Physical address with alias
    dtypesPhyA[0].contractAddress = phyaddr.address;
    await dtypeContract.insert(dtypesPhyA[0], {from: accounts[0]});
    let dtypehashphy = await dtypeContract.getTypeHash(0, 'PhysicalAddress');
    const signatureDataPhyA = (hash, nonce, name, sep) => UTILS.signatureDataInternal(web3, chainId, Alias.address, dtypehashphy, hash, nonce, name, sep);
    for (let i = 0; i < phyadata.length; i++) {
        let data = phyadata[i].data;
        // data.countryCode = web3.utils.utf8ToHex(data.countryCode);
        // data.city = web3.utils.utf8ToHex(data.city);
        // data.streetName = web3.utils.utf8ToHex(data.streetName);
        // data.postcode = web3.utils.utf8ToHex(data.postcode);
        // data.location = data.location ? web3.utils.utf8ToHex(data.location) : '0x0';
        await phyaddr.insert(phyadata[i].data);
        let hash = await phyaddr.typeIndex(i);
        aliasn = phyadata[i].alias;
        aliasn[0] = web3.utils.utf8ToHex(aliasn[0]);
        signature = await web3.eth.sign(
          signatureDataPhyA(hash, 1, ...aliasn),
          accounts[0],
        );
        await alias.setAlias(dtypehashphy, ...aliasn, hash, signature);
    }
};
