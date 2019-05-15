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

const FileTypeStorage = artifacts.require('FileTypeStorage.sol');
const FSPureFunctions = artifacts.require('FSPureFunctions.sol');

contract('gov', async (accounts) => {
    let dtype, resourceStorage, votingfunc,
        vmStorage, vpStorage, permStorage,
        action, fileStorage, fsFunctions;
    let fsPermission;
    let allowedTransitions;

    it('deploy', async () => {
        dtype = await dType.deployed();
        resourceStorage = await VoteResourceTypeStorage.deployed();
        votingfunc = await VotingFunctions.deployed();
        vmStorage = await VotingMechanismStorage.deployed();
        vpStorage = await VotingProcessStorage.deployed();
        permStorage = await PermissionStorage.deployed();
        action = await ActionContract.deployed();
        fileStorage = await FileTypeStorage.deployed();
        fsFunctions = await FSPureFunctions.deployed();
    });

    it('insert filesystem permissions', async () => {
        allowedTransitions = [
            await dtype.getTypeHash(0, 'structureData'),
            await dtype.getTypeHash(0, 'getChangedFile'),
            await dtype.getTypeHash(0, 'changeFileName'),
            await dtype.getTypeHash(0, 'changeFileParent'),
            await dtype.getTypeHash(0, 'addFolderFile'),
            await dtype.getTypeHash(0, 'removeFolderFile'),
            await dtype.getTypeHash(0, 'changeFolderFiles'),
        ];
        let functionHashPermission = await dtype.getTypeHash(0, 'getInsertPermissionKeys');
        // Insert permission for insert
        fsPermission = {
            contractAddress: fileStorage.address,
            functionSig: UTILS.getSignature(fileStorage.abi, 'insert'),
            transitionHash: CT.EMPTY_BYTES,
            dataHash: CT.EMPTY_BYTES,
            anyone: false,
            allowed: CT.EMPTY_ADDRESS,
            permissionProcess: {
                temporaryAction: UTILS.getSignature(fileStorage.abi, 'insertReview'),
                votingProcessDataHash: await vpStorage.typeIndex(0),
                functionHashPermission,
                allowedTransitions,
            }
        }

        // await permStorage.insert(fsPermission);

        let permission = await permStorage.get([
            fsPermission.contractAddress,
            fsPermission.functionSig,
            CT.EMPTY_BYTES,
            CT.EMPTY_BYTES,
        ]);
        assert.equal(permission.anyone, fsPermission.anyone);
        assert.equal(permission.allowed, fsPermission.allowed);
        assert.equal(permission.permissionProcess.temporaryAction, fsPermission.permissionProcess.temporaryAction);
        assert.equal(permission.permissionProcess.votingProcessDataHash, fsPermission.permissionProcess.votingProcessDataHash);
        assert.equal(permission.permissionProcess.functionHashPermission, fsPermission.permissionProcess.functionHashPermission);
        assert.sameMembers(permission.permissionProcess.allowedTransitions, fsPermission.permissionProcess.allowedTransitions);

        // Permission for update
        fsPermission.functionSig = UTILS.getSignature(fileStorage.abi, 'update');
        fsPermission.permissionProcess.temporaryAction = UTILS.getSignature(fileStorage.abi, 'updateReview');
        fsPermission.permissionProcess.functionHashPermission = await dtype.getTypeHash(0, 'getUpdatePermissionKeys');

        // await permStorage.insert(fsPermission);
        permission = await permStorage.get([
            fsPermission.contractAddress,
            fsPermission.functionSig,
            CT.EMPTY_BYTES,
            CT.EMPTY_BYTES,
        ]);
        assert.equal(permission.anyone, fsPermission.anyone);
        assert.equal(permission.allowed, fsPermission.allowed);
        assert.equal(permission.permissionProcess.temporaryAction, fsPermission.permissionProcess.temporaryAction);
        assert.equal(permission.permissionProcess.votingProcessDataHash, fsPermission.permissionProcess.votingProcessDataHash);
        assert.equal(permission.permissionProcess.functionHashPermission, fsPermission.permissionProcess.functionHashPermission);
        assert.sameMembers(permission.permissionProcess.allowedTransitions, fsPermission.permissionProcess.allowedTransitions);
    });

    it('permissioned filesystem test', async () => {
        // Trying to insert a new file into fs through ActionContract
        const folder = Object.assign({}, CT.EMPTY_FS);
        folder.pointer.name = 'TestFolder';
        folder.pointer.swarm.filehash = web3.utils.randomHex(32);
        folder.parentKey = await fileStorage.typeIndex(0);

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
        assert.equal(votingResource.votingProcessDataHash, fsPermission.permissionProcess.votingProcessDataHash, 'wrong votingProcessDataHash');
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

    it('update filesystem fine-grained permissions', async () => {
        let permS;
        // structureData
        // can be called by anyone
        let perm = {
            contractAddress: fileStorage.address,
            functionSig: UTILS.getSignature(fileStorage.abi, 'update'),
            transitionHash: allowedTransitions[0],
            dataHash: CT.EMPTY_BYTES,
            anyone: true,
            allowed: CT.EMPTY_ADDRESS,
            permissionProcess: {
                temporaryAction: CT.EMPTY_BYTES4,
                votingProcessDataHash: CT.EMPTY_BYTES,
                functionHashPermission: CT.EMPTY_BYTES,
                allowedTransitions: [],
            }
        }

        // await permStorage.insert(perm);
        permS = await permStorage.get([
            perm.contractAddress,
            perm.functionSig,
            allowedTransitions[0],
            CT.EMPTY_BYTES,
        ]);
        assert.equal(permS.anyone, perm.anyone, 'wrong anyone');
        assert.equal(permS.allowed, perm.allowed, 'wrong allowed');
        assert.equal(permS.permissionProcess.temporaryAction, perm.permissionProcess.temporaryAction, 'wrong temporaryAction');
        assert.equal(permS.permissionProcess.votingProcessDataHash, perm.permissionProcess.votingProcessDataHash, 'wrong votingProcessDataHash');
        assert.equal(permS.permissionProcess.functionHashPermission, perm.permissionProcess.functionHashPermission, 'wrong functionHashPermission');
        assert.sameMembers(permS.permissionProcess.allowedTransitions, perm.permissionProcess.allowedTransitions, 'wrong allowedTransitions');

        // getChangedFile
        // can be called by anyone
        perm.transitionHash = allowedTransitions[1];
        // await permStorage.insert(perm);
        permS = await permStorage.get([
            perm.contractAddress,
            perm.functionSig,
            allowedTransitions[1],
            CT.EMPTY_BYTES,
        ]);
        assert.equal(permS.anyone, perm.anyone);
        assert.equal(permS.allowed, perm.allowed);
        assert.equal(permS.permissionProcess.temporaryAction, perm.permissionProcess.temporaryAction);
        assert.equal(permS.permissionProcess.votingProcessDataHash, perm.permissionProcess.votingProcessDataHash);
        assert.equal(permS.permissionProcess.functionHashPermission, perm.permissionProcess.functionHashPermission);
        assert.sameMembers(permS.permissionProcess.allowedTransitions, perm.permissionProcess.allowedTransitions);

        // insert folder that can only be changed by accounts[1]
        const folder = Object.assign({}, CT.EMPTY_FS);
        folder.pointer.name = 'User1Folder';
        folder.pointer.swarm.filehash = web3.utils.randomHex(32);
        folder.parentKey = await fileStorage.typeIndex(0);

        let encodedParams = web3.eth.abi.encodeParameters(
            fileStorage.abi.find(fabi => fabi.name === 'insert').inputs,
            [folder],
        );

        let resourceCount = await resourceStorage.count();
        let fileCount = await fileStorage.count();
        // Try to insert folder through ActionContract
        await action.run(
            fileStorage.address,
            UTILS.getSignature(fileStorage.abi, 'insert'),
            encodedParams,
            {from: accounts[0]}
        );

        assert.equal(
            (await resourceStorage.count()).toString(),
            resourceCount.add(web3.utils.toBN('1')).toString(),
            'wrong resourceCount',
        );
        assert.equal(
            (await fileStorage.count()).toString(),
            fileCount.toString(),
            'wrong fileCount',
        );

        // New voting resource has been inserted
        let votingResourceHash = await resourceStorage.typeIndex(resourceCount);
        let votingResource = await resourceStorage.getByHash(votingResourceHash);

        let folderInReview = await fileStorage.inreview(votingResource.dataHash, accounts[0]);
        assert.equal(folderInReview.pointer.name, folder.pointer.name, 'insertedFile.name incorrect');
        assert.equal(folderInReview.pointer.extension, folder.pointer.extension, 'insertedFile.extension incorrect');
        assert.equal(folderInReview.pointer.swarm.protocol, folder.pointer.swarm.protocol, 'insertedFile.swarm incorrect');
        assert.equal(folderInReview.pointer.swarm.filehash, folder.pointer.swarm.filehash, 'insertedFile.filehash incorrect');
        assert.equal(folderInReview.parentKey, folder.parentKey, 'insertedFile.parentKey incorrect');

        await runVoteAlow(accounts, action, votingResourceHash);

        assert.equal(
            (await fileStorage.count()).toString(), fileCount.add(web3.utils.toBN('1')).toString(),
            'wrong fileCount',
        );

        let newFolder = await fileStorage.getByHash(votingResource.dataHash);
        assert.equal(newFolder.pointer.name, folder.pointer.name, 'insertedFile.name incorrect');
        assert.equal(newFolder.pointer.extension, folder.pointer.extension, 'insertedFile.extension incorrect');
        assert.equal(newFolder.pointer.swarm.protocol, folder.pointer.swarm.protocol, 'insertedFile.swarm incorrect');
        assert.equal(newFolder.pointer.swarm.filehash, folder.pointer.swarm.filehash, 'insertedFile.filehash incorrect');
        assert.equal(newFolder.parentKey, folder.parentKey, 'insertedFile.parentKey incorrect');

        // insert folder permissions for accounts[1]

        // general permission for update - dataHash
        perm.functionSig = UTILS.getSignature(fileStorage.abi, 'update');
        perm.transitionHash =  CT.EMPTY_BYTES;
        perm.dataHash = votingResource.dataHash;
        perm.anyone = false;
        perm.allowed = accounts[1];
        await permStorage.insert(perm);

        // changeFileName
        perm.transitionHash = allowedTransitions[2];
        perm.dataHash = votingResource.dataHash;
        perm.anyone = false;
        perm.allowed = accounts[1];
        await permStorage.insert(perm);
        permS = await permStorage.get([
            perm.contractAddress,
            perm.functionSig,
            perm.transitionHash,
            perm.dataHash,
        ]);
        assert.equal(permS.anyone, perm.anyone, 'wrong anyone, changeFileName');
        assert.equal(permS.allowed, perm.allowed, 'wrong allowed, changeFileName');
        assert.equal(permS.permissionProcess.temporaryAction, perm.permissionProcess.temporaryAction, 'wrong temporaryAction, changeFileName');
        assert.equal(permS.permissionProcess.votingProcessDataHash, perm.permissionProcess.votingProcessDataHash, 'wrong votingProcessDataHash, changeFileName');
        assert.equal(permS.permissionProcess.functionHashPermission, perm.permissionProcess.functionHashPermission, 'wrong functionHashPermission, changeFileName');
        assert.sameMembers(permS.permissionProcess.allowedTransitions, perm.permissionProcess.allowedTransitions, 'wrong allowedTransitions, changeFileName');

        // changeFileParent
        perm.transitionHash = allowedTransitions[3];
        await permStorage.insert(perm);
        permS = await permStorage.get([
            perm.contractAddress,
            perm.functionSig,
            perm.transitionHash,
            perm.dataHash,
        ]);
        assert.equal(permS.anyone, perm.anyone, 'wrong anyone, changeFileParent');
        assert.equal(permS.allowed, perm.allowed, 'wrong allowed, changeFileParent');
        assert.equal(permS.permissionProcess.temporaryAction, perm.permissionProcess.temporaryAction, 'wrong temporaryAction, changeFileParent');
        assert.equal(permS.permissionProcess.votingProcessDataHash, perm.permissionProcess.votingProcessDataHash, 'wrong votingProcessDataHash, changeFileParent');
        assert.equal(permS.permissionProcess.functionHashPermission, perm.permissionProcess.functionHashPermission, 'wrong functionHashPermission, changeFileParent');
        assert.sameMembers(permS.permissionProcess.allowedTransitions, perm.permissionProcess.allowedTransitions, 'wrong allowedTransitions, changeFileParent');

        // addFolderFile
        perm.transitionHash = allowedTransitions[4];
        await permStorage.insert(perm);
        permS = await permStorage.get([
            perm.contractAddress,
            perm.functionSig,
            perm.transitionHash,
            perm.dataHash,
        ]);
        assert.equal(permS.anyone, perm.anyone, 'wrong anyone, addFolderFile');
        assert.equal(permS.allowed, perm.allowed, 'wrong allowed, addFolderFile');
        assert.equal(permS.permissionProcess.temporaryAction, perm.permissionProcess.temporaryAction, 'wrong temporaryAction, addFolderFile');
        assert.equal(permS.permissionProcess.votingProcessDataHash, perm.permissionProcess.votingProcessDataHash, 'wrong votingProcessDataHash, addFolderFile');
        assert.equal(permS.permissionProcess.functionHashPermission, perm.permissionProcess.functionHashPermission, 'wrong functionHashPermission, addFolderFile');
        assert.sameMembers(permS.permissionProcess.allowedTransitions, perm.permissionProcess.allowedTransitions, 'wrong allowedTransitions, addFolderFile');

        // removeFolderFile
        perm.transitionHash = allowedTransitions[5];
        await permStorage.insert(perm);
        permS = await permStorage.get([
            perm.contractAddress,
            perm.functionSig,
            perm.transitionHash,
            perm.dataHash,
        ]);
        assert.equal(permS.anyone, perm.anyone, 'wrong anyone, removeFolderFile');
        assert.equal(permS.allowed, perm.allowed, 'wrong allowed, removeFolderFile');
        assert.equal(permS.permissionProcess.temporaryAction, perm.permissionProcess.temporaryAction, 'wrong temporaryAction, removeFolderFile');
        assert.equal(permS.permissionProcess.votingProcessDataHash, perm.permissionProcess.votingProcessDataHash, 'wrong votingProcessDataHash, removeFolderFile');
        assert.equal(permS.permissionProcess.functionHashPermission, perm.permissionProcess.functionHashPermission, 'wrong functionHashPermission, removeFolderFile');
        assert.sameMembers(permS.permissionProcess.allowedTransitions, perm.permissionProcess.allowedTransitions, 'wrong allowedTransitions, removeFolderFile');

        // changeFolderFiles
        perm.transitionHash = allowedTransitions[6];
        await permStorage.insert(perm);
        permS = await permStorage.get([
            perm.contractAddress,
            perm.functionSig,
            perm.transitionHash,
            perm.dataHash,
        ]);
        assert.equal(permS.anyone, perm.anyone, 'wrong anyone, changeFolderFiles');
        assert.equal(permS.allowed, perm.allowed, 'wrong allowed, changeFolderFiles');
        assert.equal(permS.permissionProcess.temporaryAction, perm.permissionProcess.temporaryAction, 'wrong temporaryAction, changeFolderFiles');
        assert.equal(permS.permissionProcess.votingProcessDataHash, perm.permissionProcess.votingProcessDataHash, 'wrong votingProcessDataHash, changeFolderFiles');
        assert.equal(permS.permissionProcess.functionHashPermission, perm.permissionProcess.functionHashPermission, 'wrong functionHashPermission, changeFolderFiles');
        assert.sameMembers(permS.permissionProcess.allowedTransitions, perm.permissionProcess.allowedTransitions, 'wrong allowedTransitions, changeFolderFiles');

        folder.pointer.name = "User1FolderChanged";
        // folder.parentKey = await fileStorage.typeIndex(0);
        encodedParams = web3.eth.abi.encodeParameter(
            fileStorage.abi.find(fabi => fabi.name === 'update').inputs[0],
            folder,
        );

        // try to change the folder name, accounts[0]
        // should fail
        await truffleAssert.fails(
            action.runPipe(
                fileStorage.address,
                UTILS.getSignature(fileStorage.abi, 'update'),
                [allowedTransitions[2]],
                [votingResource.dataHash],
                encodedParams,
                {from: accounts[0]}
            ),
            truffleAssert.ErrorType.REVERT,
            "Unauthorized permission"
        );

        resourceCount = await resourceStorage.count();
        fileCount = await fileStorage.count();

        // try to change the folder name, accounts[1]
        // should be successful
        let receipt = await action.runPipe(
            fileStorage.address,
            UTILS.getSignature(fileStorage.abi, 'update'),
            [allowedTransitions[0], allowedTransitions[2], allowedTransitions[1]],
            [votingResource.dataHash],
            encodedParams,
            {from: accounts[1]}
        );

        assert.equal(
            (await resourceStorage.count()).toString(),
            resourceCount.add(web3.utils.toBN('1')).toString(),
            'wrong resourceCount',
        );
        votingResourceHash = await resourceStorage.typeIndex(resourceCount);
        votingResource = await resourceStorage.getByHash(votingResourceHash);

        // Make sure file update is in review
        folderInReview = await fileStorage.inreview(votingResource.dataHash, accounts[1]);
        // console.log('folderInReview', folderInReview)
        assert.equal(folderInReview.pointer.name, folder.pointer.name, 'insertedFile.name incorrect');

        // Vote for the file update to pass
        await runVoteAlow(accounts, action, votingResourceHash);
        assert.equal(
            (await fileStorage.count()).toString(), fileCount.add(web3.utils.toBN('1')).toString(),
            'wrong fileCount',
        );
        newFolder = await fileStorage.getByHash(votingResource.dataHash);
        assert.equal(folderInReview.pointer.name, folder.pointer.name, 'insertedFile.name incorrect');
    });

    it('insert file under folder permissions', async () => {
        const folder = Object.assign({}, CT.EMPTY_FS);
        folder.pointer.name = 'User1Folder2';
        folder.pointer.swarm.filehash = web3.utils.randomHex(32);
        folder.parentKey = await fileStorage.typeIndex(0);

        let encodedParams = web3.eth.abi.encodeParameters(
            fileStorage.abi.find(fabi => fabi.name === 'insert').inputs,
            [folder],
        );
        let resourceCount = await resourceStorage.count();
        await action.run(
            fileStorage.address,
            UTILS.getSignature(fileStorage.abi, 'insert'),
            encodedParams,
            {from: accounts[0]}
        );
        // New voting resource has been inserted
        let votingResourceHash = await resourceStorage.typeIndex(resourceCount);
        let votingResource = await resourceStorage.getByHash(votingResourceHash);

        let folderInReview = await fileStorage.inreview(votingResource.dataHash, accounts[0]);
        assert.equal(folderInReview.pointer.name, folder.pointer.name, 'insertedFile.name incorrect');
        assert.equal(folderInReview.pointer.extension, folder.pointer.extension, 'insertedFile.extension incorrect');
        assert.equal(folderInReview.pointer.swarm.protocol, folder.pointer.swarm.protocol, 'insertedFile.swarm incorrect');
        assert.equal(folderInReview.pointer.swarm.filehash, folder.pointer.swarm.filehash, 'insertedFile.filehash incorrect');
        assert.equal(folderInReview.parentKey, folder.parentKey, 'insertedFile.parentKey incorrect');

        await runVoteAlow(accounts, action, votingResourceHash);
        let newFolder = await fileStorage.getByHash(votingResource.dataHash);
        assert.equal(newFolder.pointer.name, folder.pointer.name, 'insertedFile.name incorrect');
        assert.equal(newFolder.pointer.extension, folder.pointer.extension, 'insertedFile.extension incorrect');
        assert.equal(newFolder.pointer.swarm.protocol, folder.pointer.swarm.protocol, 'insertedFile.swarm incorrect');
        assert.equal(newFolder.pointer.swarm.filehash, folder.pointer.swarm.filehash, 'insertedFile.filehash incorrect');
        assert.equal(newFolder.parentKey, folder.parentKey, 'insertedFile.parentKey incorrect');

        // general permission for insert - dataHash
        let perm = {
            contractAddress: fileStorage.address,
            functionSig: UTILS.getSignature(fileStorage.abi, 'insert'),
            transitionHash: CT.EMPTY_BYTES,
            dataHash: votingResource.dataHash,
            anyone: false,
            allowed: accounts[1],
            permissionProcess: {
                temporaryAction: CT.EMPTY_BYTES4,
                votingProcessDataHash: CT.EMPTY_BYTES,
                functionHashPermission: CT.EMPTY_BYTES,
                allowedTransitions: [],
            }
        }

        await permStorage.insert(perm);

        // Try to insert a file under the folder
        // If transition is from accounts[0], it should fail
        let file = {
            "pointer": {
                "name": "TestPermissionsFile",
                "extension": 0,
                "swarm": {
                    "protocol": 1,
                    "filehash": "0x9098281bbfb81d161a71c27bae34add67e9fa9f6eb84f22c0c9aedd7b9cd2189"
                },
                "ipfs": {"protocol": 0, "filehash": "0x0000000000000000000000000000000000000000000000000000000000000000"}, "uri": {"uri": ""}
            },
            "parentKey": votingResource.dataHash,
            filesPerFolder: []
        };
        encodedParams = web3.eth.abi.encodeParameters(
            fileStorage.abi.find(fabi => fabi.name === 'insert').inputs,
            [file],
        );

        // Try to insert folder through ActionContract
        // If it is from another address than accounts[1], folder goes inreview
        resourceCount = await resourceStorage.count();
        fileCount = await fileStorage.count();
        await action.run(
            fileStorage.address,
            UTILS.getSignature(fileStorage.abi, 'insert'),
            encodedParams,
            {from: accounts[0]}
        );
        assert.equal(
            (await resourceStorage.count()).toString(),
            resourceCount.add(web3.utils.toBN('1')).toString(),
            'wrong resourceCount',
        );
        assert.equal(
            (await fileStorage.count()).toString(),
            fileCount.toString(),
            'wrong fileCount',
        );
        votingResourceHash = await resourceStorage.typeIndex(resourceCount);
        votingResource = await resourceStorage.getByHash(votingResourceHash);
        folderInReview = await fileStorage.inreview(votingResource.dataHash, accounts[0]);
        assert.equal(folderInReview.pointer.name, file.pointer.name, 'insertedFile.name incorrect');

        // If it is from accounts[1], it gets directly inserted
        resourceCount = await resourceStorage.count();
        fileCount = await fileStorage.count();

        await action.run(
            fileStorage.address,
            UTILS.getSignature(fileStorage.abi, 'insert'),
            encodedParams,
            {from: accounts[1]}
        );

        assert.equal(
            (await resourceStorage.count()).toString(),
            resourceCount.toString(),
            'wrong resourceCount',
        );
        assert.equal(
            (await fileStorage.count()).toString(),
            fileCount.add(web3.utils.toBN('1')).toString(),
            'wrong fileCount',
        );
        let insertedFile = await fileStorage.getByHash(await fileStorage.typeIndex(fileCount));
        assert.equal(insertedFile.pointer.name, file.pointer.name, 'insertedFile.name incorrect');
    });
});

async function runVoteAlow(accounts, action, votingResourceHash, pretriggerCallb) {
    // TODO address should be set in ActionContract
    await action.vote(votingResourceHash, web3.eth.abi.encodeParameters(['bool','uint256','address'], [false, 0, accounts[0]]));
    await action.vote(votingResourceHash, web3.eth.abi.encodeParameters(['bool','uint256','address'], [false, 0, accounts[1]]));
    await action.vote(votingResourceHash, web3.eth.abi.encodeParameters(['bool','uint256','address'], [false, 0, accounts[2]]));
    await action.vote(votingResourceHash, web3.eth.abi.encodeParameters(['bool','uint256','address'], [true, 0, accounts[3]]));
    await action.vote(votingResourceHash, web3.eth.abi.encodeParameters(['bool','uint256','address'], [true, 0, accounts[4]]));
    await action.vote(votingResourceHash, web3.eth.abi.encodeParameters(['bool','uint256','address'], [true, 0, accounts[5]]));
    await action.vote(votingResourceHash, web3.eth.abi.encodeParameters(['bool','uint256','address'], [true, 0, accounts[6]]));
    await action.vote(votingResourceHash, web3.eth.abi.encodeParameters(['bool','uint256','address'], [true, 0, accounts[7]]));

    if (pretriggerCallb) pretriggerCallb();

    await action.vote(votingResourceHash, web3.eth.abi.encodeParameters(['bool','uint256','address'], [true, 0, accounts[8]]));
}
