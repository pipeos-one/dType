const CT = require('./constants.js');

const dType = artifacts.require('dType.sol');
const VoteResourceTypeStorage = artifacts.require('VoteResourceTypeStorage.sol');
const VotingFunctions = artifacts.require('VotingFunctions.sol');
const VotingMechanismStorage = artifacts.require('VotingMechanismTypeStorage.sol');

// const fsData = require('../data/fs_data.json');

contract('gov', async (accounts) => {
    let dtype, resourceStorage, votingfunc, vmStorage;

    it('deploy', async () => {
        dtype = await dType.deployed();
        resourceStorage = await VoteResourceTypeStorage.deployed();
        votingfunc = await VotingFunctions.deployed();
        vmStorage = await VotingMechanismStorage.deployed();
    });

    it('gov test', async () => {
        let vote = {
            vote: 1,
            voteWeight: 0,
        }
        let funcHash = dtype.get(0, 'setWeight');
        let freeInput, signature;
        freeInput = web3.eth.abi.encodeParameters(['uint256', 'uint256'],[vote.vote, vote.voteWeight]);
        signature = await web3.eth.sign(freeInput, accounts[0]);

        let {logs} = dtype.run(funcHash, [], freeInput, signature);
        console.log('logs', logs);
    });
});
