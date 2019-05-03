const CT = require('./constants.js');
const UTILS = require('./utils.js');

const dType = artifacts.require('dType.sol');
const VoteResourceTypeStorage = artifacts.require('VoteResourceTypeStorage.sol');
const VotingFunctions = artifacts.require('VotingFunctions.sol');
const VotingMechanismStorage = artifacts.require('VotingMechanismTypeStorage.sol');
const VotingProcessStorage = artifacts.require('VotingProcessStorage.sol');
const PermissionFunctionStorage = artifacts.require('PermissionFunctionStorage.sol');
const ActionContract = artifacts.require('ActionContract.sol');

const FileTypeStorage = artifacts.require('FileTypeStorage.sol');

contract('gov', async (accounts) => {
    let dtype, resourceStorage, votingfunc, vmStorage, vpStorage, permStorage, action, fileStorage;
    let fsPermission;

    it('deploy', async () => {
        dtype = await dType.deployed();
        resourceStorage = await VoteResourceTypeStorage.deployed();
        votingfunc = await VotingFunctions.deployed();
        vmStorage = await VotingMechanismStorage.deployed();
        vpStorage = await VotingProcessStorage.deployed();
        permStorage = await PermissionFunctionStorage.deployed();
        action = await ActionContract.deployed();
        fileStorage = await FileTypeStorage.deployed();
    });

    it('insert filesystem permission', async () => {
        // Insert permission for adding new files & folders
        fsPermission = {
            contractAddress: fileStorage.address,
            functionSig: UTILS.getSignature(fileStorage.abi, 'insert'),
            anyone: false,
            allowed: CT.EMPTY_ADDRESS,
            temporaryAction: UTILS.getSignature(fileStorage.abi, 'insertReview'),
            votingProcessDataHash: await vpStorage.typeIndex(0),
        }

        await permStorage.insert(fsPermission);

        let permission = await permStorage.get(fsPermission.contractAddress, fsPermission.functionSig);
        assert.equal(permission.anyone, fsPermission.anyone);
        assert.equal(permission.allowed, fsPermission.allowed);
        assert.equal(permission.temporaryAction, fsPermission.temporaryAction);
        assert.equal(permission.votingProcessDataHash, fsPermission.votingProcessDataHash);
    });

    it('permissioned filesystem test', async () => {
        // Trying to insert a new file into fs through ActionContract
        let folder = {
            "pointer": {
                "name": "TestFolder",
                "extension": 0,
                "swarm": {
                    "protocol": 1,
                    "filehash": "0x9098281bbfb81d161a71c27bae34add67e9fa9f6eb84f22c0c9aedd7b9cd2189"
                },
                "ipfs": {"protocol": 0, "filehash": "0x0000000000000000000000000000000000000000000000000000000000000000"}, "uri": {"uri": ""}
            },
            "parentKey": "0x0000000000000000000000000000000000000000000000000000000000000000",
            filesPerFolder: []
        };

        let encodedParams = web3.eth.abi.encodeParameters(
            fileStorage.abi.find(fabi => fabi.name === 'insert').inputs,
            [folder],
        );

        let resourceCount = await resourceStorage.count();
        // Try to insert folder through ActionContract
        await action.run(
            fileStorage.address,
            UTILS.getSignature(fileStorage.abi, 'insert'),
            encodedParams,
            {from: accounts[0]}
        );

        // New voting resource has been inserted
        let votingResourceHash = await resourceStorage.typeIndex(resourceCount);
        let votingResource = await resourceStorage.getByHash(votingResourceHash);
        assert.equal(votingResource.proponent, accounts[0], 'wrong proponent');
        assert.equal(votingResource.contractAddress, fileStorage.address, 'wrong contractAddress');
        assert.exists(votingResource.dataHash, 'no dataHash');
        assert.equal(votingResource.votingProcessDataHash, fsPermission.votingProcessDataHash, 'wrong votingProcessDataHash');
        assert.equal(votingResource.scoreyes, 0, 'wrong scoreyes');
        assert.equal(votingResource.scoreno, 0, 'wrong scoreno');

        // // Permission has been inserted inreview
        let fsInReview = await fileStorage.inreview(votingResource.dataHash, votingResource.proponent);
        assert.equal(fsInReview.pointer.name, folder.pointer.name, 'insertedFile.name incorrect');
        assert.equal(fsInReview.pointer.extension, folder.pointer.extension, 'insertedFile.extension incorrect');
        assert.equal(fsInReview.pointer.swarm.protocol, folder.pointer.swarm.protocol, 'insertedFile.swarm incorrect');
        assert.equal(fsInReview.pointer.swarm.filehash, folder.pointer.swarm.filehash, 'insertedFile.filehash incorrect');
        assert.equal(fsInReview.parentKey, folder.parentKey, 'insertedFile.parentKey incorrect');

        let newFolder;

        // Voting can begin on the voting resource
        // TODO address should be set in ActionContract
        await action.vote(votingResourceHash, web3.eth.abi.encodeParameters(['bool','uint256','address'], [false, 0, accounts[0]]));
        await action.vote(votingResourceHash, web3.eth.abi.encodeParameters(['bool','uint256','address'], [false, 0, accounts[1]]));
        await action.vote(votingResourceHash, web3.eth.abi.encodeParameters(['bool','uint256','address'], [false, 0, accounts[2]]));
        await action.vote(votingResourceHash, web3.eth.abi.encodeParameters(['bool','uint256','address'], [true, 0, accounts[3]]));
        await action.vote(votingResourceHash, web3.eth.abi.encodeParameters(['bool','uint256','address'], [true, 0, accounts[4]]));
        await action.vote(votingResourceHash, web3.eth.abi.encodeParameters(['bool','uint256','address'], [true, 0, accounts[5]]));
        await action.vote(votingResourceHash, web3.eth.abi.encodeParameters(['bool','uint256','address'], [true, 0, accounts[6]]));
        await action.vote(votingResourceHash, web3.eth.abi.encodeParameters(['bool','uint256','address'], [true, 0, accounts[7]]));

        // Folder not yet accepted, still inreview
        newFolder = await fileStorage.getByHash(votingResource.dataHash);
        assert.equal(newFolder.pointer.name, '');
        assert.equal(newFolder.pointer.extension, 0);
        assert.equal(newFolder.pointer.swarm.protocol, 0);
        assert.equal(newFolder.pointer.swarm.filehash, CT.EMPTY_BYTES);
        assert.equal(newFolder.parentKey, CT.EMPTY_BYTES);

        result = await action.vote(votingResourceHash, web3.eth.abi.encodeParameters(['bool','uint256','address'], [true, 0, accounts[8]]));

        // Proposal should be accepted and removed from inreview
        let fileCount = await fileStorage.count();
        newFolder = await fileStorage.getByHash(await fileStorage.typeIndex(fileCount - 1));
        assert.equal(newFolder.pointer.name, folder.pointer.name, 'insertedFile.name incorrect');
        assert.equal(newFolder.pointer.extension, folder.pointer.extension, 'insertedFile.extension incorrect');
        assert.equal(newFolder.pointer.swarm.protocol, folder.pointer.swarm.protocol, 'insertedFile.swarm incorrect');
        assert.equal(newFolder.pointer.swarm.filehash, folder.pointer.swarm.filehash, 'insertedFile.filehash incorrect');
        assert.equal(newFolder.parentKey, folder.parentKey, 'insertedFile.parentKey incorrect');

        fsInReview = await fileStorage.inreview(votingResource.dataHash, votingResource.proponent);
        assert.equal(fsInReview.pointer.name, '');
        assert.equal(fsInReview.pointer.extension, 0);
        assert.equal(fsInReview.pointer.swarm.protocol, 0);
        assert.equal(fsInReview.pointer.swarm.filehash, CT.EMPTY_BYTES);
        assert.equal(fsInReview.parentKey, CT.EMPTY_BYTES);
    });
});
