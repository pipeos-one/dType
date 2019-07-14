const truffleAssert = require('truffle-assertions');

const CT = require('./constants.js');
const Alias = artifacts.require('Alias.sol')

contract('alias', async (accounts) => {
    let alias;
    let types = ['bytes32', 'string', 'string'];

    it('deploy', async () => {
        alias = await Alias.deployed();
    });

    it('test checkCharExists', async () => {
        assert.isOk(await alias.checkCharExists('alice@a', '@'));
        assert.isNotOk(await alias.checkCharExists('alicea', '@'));
    });

    it('test recoverAddress', async () => {
        let hash, signature;

        hash = web3.utils.randomHex(32);
        signature = await web3.eth.sign(
          signatureData(hash, 1, 'alice', '.'),
          accounts[1],
        );
        assert.equal(await alias.recoverAddress('alice', '.', hash, 1, signature), accounts[1]);
    });

    it('test alias', async () => {
        let aliasn, hash, signature, data;

        aliasn = ['alice', '.'];
        hash = web3.utils.randomHex(32);
        signature = await web3.eth.sign(
          signatureData(hash, 1, ...aliasn),
          accounts[1],
        );
        await alias.setAlias(...aliasn, hash, signature);
        data = await alias.getAlias(...aliasn);
        assert.equal(data.identifier, hash, 'wrong hash');
        assert.equal(data.owner, accounts[1], 'wrong owner');
        assert.equal(data.nonce, 1, 'wrong nonce');

        aliasn = ['bob', '@'];
        hash = web3.utils.randomHex(32);
        signature = await web3.eth.sign(
          signatureData(hash, 1, ...aliasn),
          accounts[1],
        );
        await alias.setAlias(...aliasn, hash, signature);
        data = await alias.getAlias(...aliasn);
        assert.equal(data.identifier, hash);
        assert.equal(data.owner, accounts[1]);
        assert.equal(data.nonce, 1, 'wrong nonce');

        aliasn = ['bob', '#'];
        hash = web3.utils.randomHex(32);
        signature = await web3.eth.sign(
          signatureData(hash, 1, ...aliasn),
          accounts[2],
        );
        await alias.setAlias(...aliasn, hash, signature);
        data = await alias.getAlias(...aliasn);
        assert.equal(data.identifier, hash);
        assert.equal(data.owner, accounts[2]);
        assert.equal(data.nonce, 1, 'wrong nonce');

        aliasn = ['bob', '/'];
        hash = web3.utils.randomHex(32);
        signature = await web3.eth.sign(
          signatureData(hash, 1, ...aliasn),
          accounts[1],
        );
        await alias.setAlias(...aliasn, hash, signature);
        data = await alias.getAlias(...aliasn);
        assert.equal(data.identifier, hash);
        assert.equal(data.owner, accounts[1]);
        assert.equal(data.nonce, 1, 'wrong nonce');

        aliasn = ['alice.', '.'];
        hash = web3.utils.randomHex(32);
        signature = await web3.eth.sign(
          signatureData(hash, 1, ...aliasn),
          accounts[1],
        );
        await truffleAssert.fails(
            alias.setAlias(...aliasn, hash, signature),
            truffleAssert.ErrorType.REVERT,
            'Name contains separator',
        );

        aliasn = ['.alice', '.'];
        hash = web3.utils.randomHex(32);
        signature = await web3.eth.sign(
          signatureData(hash, 1, ...aliasn),
          accounts[1],
        );
        await truffleAssert.fails(
            alias.setAlias(...aliasn, hash, signature),
            truffleAssert.ErrorType.REVERT,
            'Name contains separator',
        );

        aliasn = ['bo/b', '/'];
        hash = web3.utils.randomHex(32);
        signature = await web3.eth.sign(
          signatureData(hash, 1, ...aliasn),
          accounts[1],
        );
        await truffleAssert.fails(
            alias.setAlias(...aliasn, hash, signature),
            truffleAssert.ErrorType.REVERT,
            'Name contains separator',
        );
    });

    it ('test nonce', async () => {
        let data;
        let aliasn = ['brenda', '.'];
        let hash1 = web3.utils.randomHex(32);
        let hash2 = web3.utils.randomHex(32);

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

        await alias.setAlias(...aliasn, hash1, signature1);
        data = await alias.getAlias(...aliasn);
        assert.equal(data.nonce, 1, 'wrong nonce');

        await truffleAssert.fails(
            alias.setAlias(...aliasn, hash2, signature21),
            truffleAssert.ErrorType.REVERT,
            'Not owner',
        );

        await alias.setAlias(...aliasn, hash2, signature22);
        data = await alias.getAlias(...aliasn);
        assert.equal(data.nonce, 2, 'wrong nonce');
    });

    it ('test alias owner', async () => {
        let data;
        let aliasn = ['profile', '.'];
        let hash1 = web3.utils.randomHex(32);
        let hash2 = web3.utils.randomHex(32);

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

        await alias.setAlias(...aliasn, hash1, signature12);
        data = await alias.getAlias(...aliasn);
        assert.equal(data.identifier, hash1);
        assert.equal(data.owner, accounts[2]);
        assert.equal(data.nonce, 1, 'wrong nonce');

        await truffleAssert.fails(
            alias.setAlias(...aliasn, hash2, signature21, {from: accounts[1]}),
            truffleAssert.ErrorType.REVERT,
            'Not owner',
        );
        await truffleAssert.fails(
            alias.setAlias(...aliasn, hash2, signature21, {from: accounts[2]}),
            truffleAssert.ErrorType.REVERT,
            'Not owner',
        );

        await alias.setAlias(...aliasn, hash2, signature22, {from: accounts[2]});
        data = await alias.getAlias(...aliasn);
        assert.equal(data.identifier, hash2);
        assert.equal(data.owner, accounts[2]);
        assert.equal(data.nonce, 2, 'wrong nonce');
    });

    it('test strSplit', async () => {
        let split;

        split = await alias.strSplit('alice.domain', '.');
        assert.equal(split.name1, 'alice');
        assert.equal(split.name2, 'domain');

        split = await alias.strSplit('bob@domain', '@');
        assert.equal(split.name1, 'bob');
        assert.equal(split.name2, 'domain');
    });
});

const signatureData = (hash, nonce, name, sep) => {
  nonce = String(nonce);
  return hash + '0'.repeat(16 - nonce.length) + nonce + web3.utils.utf8ToHex(`${name}${sep}`).substring(2);
}
