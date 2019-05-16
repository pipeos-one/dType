const truffleAssert = require('truffle-assertions');

const CT = require('./constants.js');
const UTILS = require('./utils.js');

const dType = artifacts.require('dType.sol');
const VoteResourceTypeStorage = artifacts.require('VoteResourceTypeStorage.sol');
const VotingFunctions = artifacts.require('VotingFunctions.sol');
const VotingMechanismStorage = artifacts.require('VotingMechanismTypeStorage.sol');
const VotingProcessStorage = artifacts.require('VotingProcessStorage.sol');
const PermissionStorage = artifacts.require('PermissionStorage.sol');
const ActionContract = artifacts.require('ActionContract.sol');

contract('gov', async (accounts) => {
    let dtype, resourceStorage, votingfunc, vmStorage, vpStorage, permStorage, action;

    it('deploy', async () => {
        dtype = await dType.deployed();
        resourceStorage = await VoteResourceTypeStorage.deployed();
        votingfunc = await VotingFunctions.deployed();
        vmStorage = await VotingMechanismStorage.deployed();
        vpStorage = await VotingProcessStorage.deployed();
        permStorage = await PermissionStorage.deployed();
        action = await ActionContract.deployed();
    });

    it('gov permission test', async () => {
        // Trying to insert a new permission through ActionContract
        let newperm = {
            contractAddress: vmStorage.address,
            functionSig: UTILS.getSignature(vmStorage.abi, 'insert'),
            transitionHash: CT.EMPTY_BYTES,
            dataHash: CT.EMPTY_BYTES,
            anyone: false,
            allowed: CT.EMPTY_ADDRESS,
            permissionProcess: {
                temporaryAction: UTILS.getSignature(vmStorage.abi, 'insert'),
                votingProcessDataHash: await vpStorage.typeIndex(0),
                functionHashPermission: CT.EMPTY_BYTES,
                allowedTransitions: [],
            }
        }

        let encodedParams = web3.eth.abi.encodeParameters(
            permStorage.abi.find(fabi => fabi.name === 'insert').inputs,
            [newperm],
        );

        let permission = await permStorage.get([
            permStorage.address,
            UTILS.getSignature(permStorage.abi, 'insert'),
            CT.EMPTY_BYTES,
            CT.EMPTY_BYTES,
        ]);
        assert.exists(permission.permissionProcess.temporaryAction);
        assert.exists(permission.permissionProcess.votingProcessDataHash);

        let votingProcess = await vpStorage.getByHash(permission.permissionProcess.votingProcessDataHash);
        assert.exists(votingProcess.votingMechanismDataHash);
        assert.exists(votingProcess.funcHashYes);
        assert.exists(votingProcess.funcHashNo);

        let votingMechanism = await vmStorage.getByHash(votingProcess.votingMechanismDataHash);
        assert.exists(votingMechanism.processVoteFunctions);
        assert.exists(votingMechanism.processStateFunctions);
        assert.exists(votingMechanism.parameters);

        await action.run(
            permStorage.address,
            UTILS.getSignature(permStorage.abi, 'insert'),
            encodedParams,
            {from: accounts[0]}
        );

        // New voting resource has been inserted
        let votingResourceHash = await resourceStorage.typeIndex(0);
        let votingResource = await resourceStorage.getByHash(votingResourceHash);
        assert.equal(votingResource.proponent, accounts[0], 'wrong votingResource.proponent');
        assert.equal(votingResource.contractAddress, permStorage.address, 'wrong votingResource.contractAddress');
        assert.exists(votingResource.dataHash, 'wrong votingResource.dataHash');
        assert.equal(votingResource.votingProcessDataHash, permission.permissionProcess.votingProcessDataHash, 'wrong votingResource.votingProcessDataHash');
        assert.equal(votingResource.scoreyes, 0, 'wrong votingResource.scoreyes');
        assert.equal(votingResource.scoreno, 0, 'wrong votingResource.scoreno');

        // Permission has been inserted inreview
        let permInReview = await permStorage.inreview(votingResource.dataHash, votingResource.proponent);
        assert.equal(permInReview.anyone, newperm.anyone, 'wrong permInReview.anyone');
        assert.equal(permInReview.allowed, newperm.allowed, 'wrong permInReview.allowed');
        assert.equal(permInReview.permissionProcess.temporaryAction, newperm.permissionProcess.temporaryAction, 'wrong permInReview.temporaryAction');
        assert.equal(permInReview.permissionProcess.votingProcessDataHash, newperm.permissionProcess.votingProcessDataHash, 'wrong permInReview.votingProcessDataHash');

        let newPermission;
        let permCount = await permStorage.count();

        // Voting can begin on the voting resource
        // TODO address should be set in ActionContract
        await action.vote(votingResourceHash, web3.eth.abi.encodeParameters(['bool','uint256','address'], [false, 0, accounts[0]]));
        await truffleAssert.fails(
            action.vote(votingResourceHash, web3.eth.abi.encodeParameters(['bool','uint256','address'], [false, 0, accounts[0]])),
            truffleAssert.ErrorType.REVERT,
            'voting failed',
        );
        await action.vote(votingResourceHash, web3.eth.abi.encodeParameters(['bool','uint256','address'], [false, 0, accounts[1]]));
        await action.vote(votingResourceHash, web3.eth.abi.encodeParameters(['bool','uint256','address'], [false, 0, accounts[2]]));
        await action.vote(votingResourceHash, web3.eth.abi.encodeParameters(['bool','uint256','address'], [true, 0, accounts[3]]));
        await action.vote(votingResourceHash, web3.eth.abi.encodeParameters(['bool','uint256','address'], [true, 0, accounts[4]]));
        await action.vote(votingResourceHash, web3.eth.abi.encodeParameters(['bool','uint256','address'], [true, 0, accounts[5]]));
        await action.vote(votingResourceHash, web3.eth.abi.encodeParameters(['bool','uint256','address'], [true, 0, accounts[6]]));
        await action.vote(votingResourceHash, web3.eth.abi.encodeParameters(['bool','uint256','address'], [true, 0, accounts[7]]));

        // Proposal not yet accepted, still inreview
        assert.equal(
            (await permStorage.count()).toString(),
            permCount.toString(),
            'wrong permCount',
        );
        newPermission = await permStorage.getByHash(votingResource.dataHash);
        assert.equal(newPermission.anyone, false);
        assert.equal(newPermission.allowed, CT.EMPTY_ADDRESS);
        assert.equal(newPermission.permissionProcess.temporaryAction, '0x00000000');
        assert.equal(newPermission.permissionProcess.votingProcessDataHash, CT.EMPTY_BYTES);

        result = await action.vote(votingResourceHash, web3.eth.abi.encodeParameters(['bool','uint256','address'], [true, 0, accounts[8]]));

        // Proposal should be accepted and removed from inreview
        assert.equal(
            (await permStorage.count()).toString(),
            permCount.add(web3.utils.toBN('1')).toString(),
            'wrong permCount',
        );
        newPermission = await permStorage.getByHash(await permStorage.typeIndex(permCount));
        assert.equal(newPermission.anyone, newperm.anyone, 'wrong newPermission.anyone');
        assert.equal(newPermission.allowed, newperm.allowed, 'wrong newPermission.allowed');
        assert.equal(newPermission.permissionProcess.temporaryAction, newperm.permissionProcess.temporaryAction, 'wrong newPermission.temporaryAction');
        assert.equal(newPermission.permissionProcess.votingProcessDataHash, newperm.permissionProcess.votingProcessDataHash, 'wrong newPermission.votingProcessDataHash');

        permInReview = await permStorage.inreview(votingResource.dataHash, votingResource.proponent);
        assert.equal(permInReview.anyone, false);
        assert.equal(permInReview.allowed, CT.EMPTY_ADDRESS);
        assert.equal(permInReview.permissionProcess.temporaryAction, '0x00000000');
        assert.equal(permInReview.permissionProcess.votingProcessDataHash, CT.EMPTY_BYTES);
    });
});
