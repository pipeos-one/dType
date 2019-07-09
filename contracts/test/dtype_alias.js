const truffleAssert = require('truffle-assertions');

const CT = require('./constants.js');
const Alias = artifacts.require('Alias.sol')

contract('alias alias', async (accounts) => {
    let alias;

    it('deploy', async () => {
        alias = await Alias.deployed();
    });

    it('test checkCharExists', async() => {
        assert.isOk(await alias.checkCharExists('alice@a', '@'));
        assert.isNotOk(await alias.checkCharExists('alicea', '@'));
    });

    it('test alias', async() => {
        let hash1 = web3.utils.randomHex(32);
        await alias.setAlias('alice', '.', hash1);
        assert.equal(await alias.getAlias('alice', '.'), hash1);

        let hash2 = web3.utils.randomHex(32);
        await alias.setAlias('bob', '@', hash2);
        assert.equal(await alias.getAlias('bob', '@'), hash2);

        let hash3 = web3.utils.randomHex(32);
        await alias.setAlias('bob', '#', hash3);
        assert.equal(await alias.getAlias('bob', '#'), hash3);

        let hash4 = web3.utils.randomHex(32);
        await alias.setAlias('bob', '/', hash4);
        assert.equal(await alias.getAlias('bob', '/'), hash4);

        await truffleAssert.fails(
            alias.setAlias('alice.', '.', web3.utils.randomHex(32)),
            truffleAssert.ErrorType.REVERT,
            'Name contains separator',
        );

        await truffleAssert.fails(
            alias.setAlias('.alice', '.', web3.utils.randomHex(32)),
            truffleAssert.ErrorType.REVERT,
            'Name contains separator',
        );

        await truffleAssert.fails(
            alias.setAlias('bo/b', '/', web3.utils.randomHex(32)),
            truffleAssert.ErrorType.REVERT,
            'Name contains separator',
        );
    });

    it('test strSplit', async() => {
        let split;

        split = await alias.strSplit('alice.domain', '.');
        assert.equal(split.name1, 'alice');
        assert.equal(split.name2, 'domain');

        split = await alias.strSplit('bob@domain', '@');
        assert.equal(split.name1, 'bob');
        assert.equal(split.name2, 'domain');
    });
});
