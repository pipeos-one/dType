const truffleAssert = require('truffle-assertions');

const CT = require('./constants.js');
const UTILS = require('./utils.js');
const Alias = artifacts.require('Alias.sol');
const dType = artifacts.require('dType.sol');
const FileStorage = artifacts.require('FileTypeStorage.sol');

contract('alias', async (accounts) => {
    let alias, dtype, files, chainId, signatureData;
    let types = ['bytes32', 'bytes1', 'string'];
    let dtypehash;
    const SEPARATOR = {
      DOT: web3.utils.utf8ToHex('.'),
      AT: web3.utils.utf8ToHex('@'),
      HASH: web3.utils.utf8ToHex('#'),
      SLASH: web3.utils.utf8ToHex('/'),
    }

    it('deploy', async () => {
        chainId = await web3.eth.net.getId();

        alias = await Alias.deployed();
        dtype = await dType.deployed();
        files = await FileStorage.deployed();
        assert.equal(dtype.address, await alias.dType());
        assert.equal(chainId, await alias.chainId());

        dtypehash = await dtype.getTypeHash(0, 'FileType');
        signatureData = (hash, nonce, name, sep) => UTILS.signatureDataInternal(web3, chainId, alias.address, dtypehash, hash, nonce, name, sep);
    });

    it('test checkCharExists', async () => {
        assert.isOk(await alias.checkCharExists('alice@a', SEPARATOR.AT));
        assert.isNotOk(await alias.checkCharExists('alicea', SEPARATOR.AT));
    });

    it('test recoverAddress', async () => {
        let hash, signature;

        hash = web3.utils.randomHex(32);
        signature = await web3.eth.sign(
          signatureData(hash, 1, SEPARATOR.DOT, 'alice'),
          accounts[1],
        );
        assert.equal(await alias.recoverAddress(dtypehash, SEPARATOR.DOT, 'alice', hash, 1, signature), accounts[1]);
    });

    it('test alias', async () => {
        let aliasn, hash, signature, data, reverse;
        hash = await files.typeIndex(1);

        aliasn = [SEPARATOR.DOT, 'alice'];
        signature = await web3.eth.sign(
          signatureData(hash, 1, ...aliasn),
          accounts[1],
        );
        await alias.setAlias(dtypehash, ...aliasn, hash, signature);
        data = await alias.getAliasedData(dtypehash, ...aliasn);
        assert.equal(data.identifier, hash, 'wrong hash');
        assert.equal(data.owner, accounts[1], 'wrong owner');
        assert.equal(data.nonce, 1, 'wrong nonce');
        reverse = await alias.getReverse(dtypehash, hash);
        assert.equal(reverse, web3.utils.hexToUtf8(aliasn[0]) + aliasn[1], 'wrong reverse alias');

        aliasn = [SEPARATOR.AT, 'bob'];
        signature = await web3.eth.sign(
          signatureData(hash, 1, ...aliasn),
          accounts[1],
        );
        await alias.setAlias(dtypehash, ...aliasn, hash, signature);
        data = await alias.getAliasedData(dtypehash, ...aliasn);
        assert.equal(data.identifier, hash);
        assert.equal(data.owner, accounts[1]);
        assert.equal(data.nonce, 1, 'wrong nonce');
        reverse = await alias.getReverse(dtypehash, hash);
        assert.equal(reverse, web3.utils.hexToUtf8(aliasn[0]) + aliasn[1], 'wrong reverse alias');

        aliasn = [SEPARATOR.HASH, 'bob'];
        signature = await web3.eth.sign(
          signatureData(hash, 1, ...aliasn),
          accounts[2],
        );
        await alias.setAlias(dtypehash, ...aliasn, hash, signature);
        data = await alias.getAliasedData(dtypehash, ...aliasn);
        assert.equal(data.identifier, hash);
        assert.equal(data.owner, accounts[2]);
        assert.equal(data.nonce, 1, 'wrong nonce');
        reverse = await alias.getReverse(dtypehash, hash);
        assert.equal(reverse, web3.utils.hexToUtf8(aliasn[0]) + aliasn[1], 'wrong reverse alias');

        aliasn = [SEPARATOR.SLASH, 'bob'];
        signature = await web3.eth.sign(
          signatureData(hash, 1, ...aliasn),
          accounts[1],
        );
        await alias.setAlias(dtypehash, ...aliasn, hash, signature);
        data = await alias.getAliasedData(dtypehash, ...aliasn);
        assert.equal(data.identifier, hash);
        assert.equal(data.owner, accounts[1]);
        assert.equal(data.nonce, 1, 'wrong nonce');
        reverse = await alias.getReverse(dtypehash, hash);
        assert.equal(reverse, web3.utils.hexToUtf8(aliasn[0]) + aliasn[1], 'wrong reverse alias');

        aliasn = [SEPARATOR.DOT, 'alice.'];
        signature = await web3.eth.sign(
          signatureData(hash, 1, ...aliasn),
          accounts[1],
        );
        await truffleAssert.fails(
            alias.setAlias(dtypehash, ...aliasn, hash, signature),
            truffleAssert.ErrorType.REVERT,
            'Name contains separator',
        );

        aliasn = [SEPARATOR.DOT, '.alice'];
        signature = await web3.eth.sign(
          signatureData(hash, 1, ...aliasn),
          accounts[1],
        );
        await truffleAssert.fails(
            alias.setAlias(dtypehash, ...aliasn, hash, signature),
            truffleAssert.ErrorType.REVERT,
            'Name contains separator',
        );

        aliasn = [SEPARATOR.SLASH, 'bo/b'];
        signature = await web3.eth.sign(
          signatureData(hash, 1, ...aliasn),
          accounts[1],
        );
        await truffleAssert.fails(
            alias.setAlias(dtypehash, ...aliasn, hash, signature),
            truffleAssert.ErrorType.REVERT,
            'Name contains separator',
        );
    });

    it ('test dtype check', async () => {
        let aliasn = [SEPARATOR.DOT, 'sometype'];
        let hash = web3.utils.randomHex(32);
        let signature = await web3.eth.sign(
          signatureData(hash, 1, ...aliasn),
          accounts[1],
        );
        await truffleAssert.fails(
            alias.setAlias(dtypehash, ...aliasn, hash, signature),
            truffleAssert.ErrorType.REVERT,
            'Not stored',
        );
    });

    it ('test nonce', async () => {
        let data;
        let aliasn = [SEPARATOR.DOT, 'brenda'];
        let hash1 = await files.typeIndex(1);
        let hash2 = await files.typeIndex(2);

        let signature1 = await web3.eth.sign(
          signatureData(hash1, 1, ...aliasn),
          accounts[3],
        );
        let signature21 = await web3.eth.sign(
          signatureData(hash2, 1, ...aliasn),
          accounts[3],
        );
        let signature22 = await web3.eth.sign(
          signatureData(hash2, 2, ...aliasn),
          accounts[3],
        );

        await alias.setAlias(dtypehash, ...aliasn, hash1, signature1);
        data = await alias.getAliasedData(dtypehash, ...aliasn);
        assert.equal(data.nonce, 1, 'wrong nonce');

        await truffleAssert.fails(
            alias.setAlias(dtypehash, ...aliasn, hash2, signature21),
            truffleAssert.ErrorType.REVERT,
            'Not owner',
        );

        await alias.setAlias(dtypehash, ...aliasn, hash2, signature22);
        data = await alias.getAliasedData(dtypehash, ...aliasn);
        assert.equal(data.nonce, 2, 'wrong nonce');
    });

    it ('test alias owner', async () => {
        let data;
        let aliasn = [SEPARATOR.DOT, 'profile'];
        let hash1 = await files.typeIndex(3);
        let hash2 = await files.typeIndex(4);

        let signature12 = await web3.eth.sign(
          signatureData(hash1, 1, ...aliasn),
          accounts[2],
        );
        let signature21 = await web3.eth.sign(
          signatureData(hash2, 2, ...aliasn),
          accounts[1],
        );
        let signature22 = await web3.eth.sign(
          signatureData(hash2, 2, ...aliasn),
          accounts[2],
        );

        await alias.setAlias(dtypehash, ...aliasn, hash1, signature12);
        data = await alias.getAliasedData(dtypehash, ...aliasn);
        assert.equal(data.identifier, hash1);
        assert.equal(data.owner, accounts[2]);
        assert.equal(data.nonce, 1, 'wrong nonce');

        await truffleAssert.fails(
            alias.setAlias(dtypehash, ...aliasn, hash2, signature21, {from: accounts[1]}),
            truffleAssert.ErrorType.REVERT,
            'Not owner',
        );
        await truffleAssert.fails(
            alias.setAlias(dtypehash, ...aliasn, hash2, signature21, {from: accounts[2]}),
            truffleAssert.ErrorType.REVERT,
            'Not owner',
        );

        await alias.setAlias(dtypehash, ...aliasn, hash2, signature22, {from: accounts[2]});
        data = await alias.getAliasedData(dtypehash, ...aliasn);
        assert.equal(data.identifier, hash2);
        assert.equal(data.owner, accounts[2]);
        assert.equal(data.nonce, 2, 'wrong nonce');
    });

    it('test alias remove', async () => {
        let aliasn, hash, signature, nonce, data;

        aliasn = [SEPARATOR.DOT, 'resource'];
        hash = await files.typeIndex(5);
        nonce = 1;

        // Cannot remove inexistent alias
        signature = await web3.eth.sign(
          signatureData(CT.EMPTY_BYTES, nonce, ...aliasn),
          accounts[1],
        );
        await truffleAssert.fails(
            alias.setAlias(dtypehash, ...aliasn, CT.EMPTY_BYTES, signature, {from: accounts[1]}),
            truffleAssert.ErrorType.REVERT,
            'Alias is not set',
        );

        // Set alias
        signature = await web3.eth.sign(
          signatureData(hash, nonce, ...aliasn),
          accounts[1],
        );
        await alias.setAlias(dtypehash, ...aliasn, hash, signature);
        data = await alias.getAliasedData(dtypehash, ...aliasn);
        assert.equal(data.identifier, hash, 'wrong hash');
        assert.equal(data.owner, accounts[1], 'wrong owner');
        assert.equal(data.nonce, 1, 'wrong nonce');
        reverse = await alias.getReverse(dtypehash, hash);
        assert.equal(reverse, web3.utils.hexToUtf8(aliasn[0]) + aliasn[1], 'wrong reverse alias');

        // Remove alias
        nonce += 1;
        signature = await web3.eth.sign(
          signatureData(CT.EMPTY_BYTES, nonce, ...aliasn),
          accounts[1],
        );
        await alias.setAlias(dtypehash, ...aliasn, CT.EMPTY_BYTES, signature);
        data = await alias.getAliasedData(dtypehash, ...aliasn);
        assert.equal(data.identifier, CT.EMPTY_BYTES, 'hash not removed');
        assert.equal(data.owner, CT.EMPTY_ADDRESS, 'owner not removed');
        assert.equal(data.nonce, 0, 'nonce not removed');
        reverse = await alias.getReverse(dtypehash, hash);
        assert.equal(reverse, '', 'reverse alias not removed');

        // Make sure alias can be set again
        hash = await files.typeIndex(6);
        nonce = 1;
        signature = await web3.eth.sign(
          signatureData(hash, nonce, ...aliasn),
          accounts[2],
        );
        await alias.setAlias(dtypehash, ...aliasn, hash, signature);
        data = await alias.getAliasedData(dtypehash, ...aliasn);
        assert.equal(data.identifier, hash, 'wrong hash');
        assert.equal(data.owner, accounts[2], 'wrong owner');
        assert.equal(data.nonce, 1, 'wrong nonce');
    });

    it('test get dtype data', async () => {
        let hash = await files.typeIndex(0);
        let data = await alias.getdTypeData(dtypehash, hash);
        let outs = UTILS.getFuncOut(files.abi, 'getByHash');
        let decoded = web3.eth.abi.decodeParameters(outs, data);
        assert.isOk(decoded.data.pointer.name);
    });

    it('test strSplit', async () => {
        let split;

        split = await alias.strSplit('alice.domain', SEPARATOR.DOT);
        assert.equal(split.name1, 'alice');
        assert.equal(split.name2, 'domain');

        split = await alias.strSplit('bob@domain', SEPARATOR.AT);
        assert.equal(split.name1, 'bob');
        assert.equal(split.name2, 'domain');
    });
});
