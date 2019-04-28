const CT = require('./constants.js');
const UTILS = require('./utils.js');

const dType = artifacts.require('dType.sol');
const VoteResourceTypeStorage = artifacts.require('VoteResourceTypeStorage.sol');
const VotingFunctions = artifacts.require('VotingFunctions.sol');
const VotingMechanismStorage = artifacts.require('VotingMechanismTypeStorage.sol');
const VotingProcessStorage = artifacts.require('VotingProcessStorage.sol');
const PermissionFunctionStorage = artifacts.require('PermissionFunctionStorage.sol');
const ActionContract = artifacts.require('ActionContract.sol');

// const fsData = require('../data/fs_data.json');

contract('gov', async (accounts) => {
    let dtype, resourceStorage, votingfunc, vmStorage, vpStorage, permStorage, action;

    it('deploy', async () => {
        dtype = await dType.deployed();
        resourceStorage = await VoteResourceTypeStorage.deployed();
        votingfunc = await VotingFunctions.deployed();
        vmStorage = await VotingMechanismStorage.deployed();
        vpStorage = await VotingProcessStorage.deployed();
        permStorage = await PermissionFunctionStorage.deployed();
        action = await ActionContract.deployed();
    });

    it('gov test', async () => {
        // Trying to insert a new permission through ActionContract
        let newperm = {
            contractAddress: vmStorage.address,
            functionSig: UTILS.getSignature(vmStorage.abi, 'insert'),
            anyone: false,
            allowed: CT.EMPTY_ADDRESS,
            temporaryAction: UTILS.getSignature(vmStorage.abi, 'insert'),
            votingProcessDataHash: await vpStorage.typeIndex(0),
        }

        let encodedParams = web3.eth.abi.encodeParameters(
            permStorage.abi.find(fabi => fabi.name === 'insert').inputs,
            [newperm],
        );

        let permission = await permStorage.get([permStorage.address, UTILS.getSignature(permStorage.abi, 'insert')]);
        // console.log('permission', permission);

        let {logs} = await action.run(
            permStorage.address,
            UTILS.getSignature(permStorage.abi, 'insert'),
            encodedParams,
        );
        console.log('logs run', logs);

        let votingResourceHash = await resourceStorage.typeIndex(0)
        let votingResource = await resourceStorage.getByHash(votingResourceHash);
        // console.log('votingResource', votingResource);

        let votingProcess = await vpStorage.getByHash(votingResource.votingProcessDataHash);
        // console.log('votingProcess', votingProcess);

        let votingMechanism = await vmStorage.getByHash(votingProcess.votingMechanismDataHash);
        // console.log('votingMechanism', votingMechanism);

        let permission2;

        // TODO address should be set in ActionContract
        await action.vote(votingResourceHash, web3.eth.abi.encodeParameters(['bool','uint256','address'], [false, 0, accounts[0]]));
        await action.vote(votingResourceHash, web3.eth.abi.encodeParameters(['bool','uint256','address'], [false, 0, accounts[1]]));
        await action.vote(votingResourceHash, web3.eth.abi.encodeParameters(['bool','uint256','address'], [false, 0, accounts[2]]));
        await action.vote(votingResourceHash, web3.eth.abi.encodeParameters(['bool','uint256','address'], [true, 0, accounts[3]]));
        await action.vote(votingResourceHash, web3.eth.abi.encodeParameters(['bool','uint256','address'], [true, 0, accounts[4]]));
        await action.vote(votingResourceHash, web3.eth.abi.encodeParameters(['bool','uint256','address'], [true, 0, accounts[5]]));
        await action.vote(votingResourceHash, web3.eth.abi.encodeParameters(['bool','uint256','address'], [true, 0, accounts[6]]));
        await action.vote(votingResourceHash, web3.eth.abi.encodeParameters(['bool','uint256','address'], [true, 0, accounts[7]]));

        permission2 = await permStorage.getByHash(await permStorage.typeIndex(1));
        console.log('permission2 00', permission2);

        result = await action.vote(votingResourceHash, web3.eth.abi.encodeParameters(['bool','uint256','address'], [true, 0, accounts[8]]));
        // console.log('vote logs', result.logs);

        permission2 = await permStorage.getByHash(await permStorage.typeIndex(1));
        console.log('permission2 11', permission2);
    });
});
