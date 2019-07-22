const UTILS = require('../test/utils.js');

const dTypeLib = artifacts.require('dTypeLib.sol');
const dType = artifacts.require("dType.sol");
const testUtils = artifacts.require('TestUtils.sol');
const typeALib = artifacts.require('typeALib.sol');
const typeAContract = artifacts.require('typeAContract.sol');
const typeBContract = artifacts.require('typeBContract.sol');
const typeABLogic = artifacts.require('typeABLogic.sol');
const typeAAFunctions = artifacts.require('typeAAFunctions');
const Alias = artifacts.require('Alias');
const MarkdownLib = artifacts.require('MarkdownLib');
const MarkdownStorage = artifacts.require('MarkdownStorage');

const dtypesBase = require('../data/dtypes_test.json');
const dtypesComposed = require('../data/dtypes_composed.json');
const dtypesCore = require('../data/dtypes_core.json');
const dtypesMd = require('../data/dtypes_md.json');
const mddata = require('../data/md_data.json');

module.exports = async function(deployer, network, accounts) {
    const chainId = await web3.eth.net.getId();
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
    await deployer.deploy(Alias, dType.address, chainId);

    await deployer.deploy(MarkdownLib);
    await deployer.link(MarkdownLib, MarkdownStorage);
    await deployer.deploy(MarkdownStorage);

    let dtypeContract = await dType.deployed();
    let typeA = await typeAContract.deployed();
    let typeB = await typeBContract.deployed();
    let typeAB = await typeABLogic.deployed();
    let typeAAF = await typeAAFunctions.deployed();
    let alias = await Alias.deployed();
    let md = await MarkdownStorage.deployed();

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

    // Markdown example with alias
    dtypesMd[0].contractAddress = md.address;
    await dtypeContract.insert(dtypesMd[0], {from: accounts[0]});
    let dtypehash = await dtypeContract.getTypeHash(0, 'markdown');
    const signatureData = (hash, nonce, name, sep) => UTILS.signatureDataInternal(web3, chainId, Alias.address, hash, nonce, name, sep);
    for (let i = 0; i < mddata.length; i++) {
        await md.insert(mddata[i].data);
        let hash = await md.typeIndex(i);
        aliasn = mddata[i].alias;
        aliasn[1] = web3.utils.utf8ToHex(aliasn[1]);
        signature = await web3.eth.sign(
          signatureData(hash, 1, ...aliasn),
          accounts[1],
        );
        await alias.setAlias(dtypehash, ...aliasn, hash, signature);
    }

    if (network == 'development') {
        await deployer.deploy(testUtils);
    }
};
