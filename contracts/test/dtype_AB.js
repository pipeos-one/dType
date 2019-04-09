const dType = artifacts.require('dType.sol')
const typeAContract = artifacts.require('typeAContract.sol')
const typeBContract = artifacts.require('typeBContract.sol')
const typeABLogic = artifacts.require('typeABLogic.sol')
const testUtils = artifacts.require('TestUtils.sol');

contract('dTypeAB', async (accounts) => {
    let dtype, typeA, typeB, typeAB, utils;

    it('deploy', async () => {
        dtype = await dType.deployed();
        typeA = await typeAContract.deployed();
        typeB = await typeBContract.deployed();
        typeAB = await typeABLogic.deployed();
        utils = await testUtils.new();
    });

    it('insert data', async() => {
        let logs, hash, index, typeBStruct;
        let tokenAddress = '0xEAd8C52989b587B0c6a8478f8B6dd447E2fc8B1f';

        ({logs} = await typeB.insert({
            staked: 2,
            typeA: {balance: 10, token: tokenAddress},
        }));
        ({hash, index} = logs[0].args);
        typeBStruct = await typeB.getByHash(hash);

        assert.equal(typeBStruct.staked, 2, 'run function incorrect output - staked');
        assert.equal(typeBStruct.typeA.balance, 10, 'run function incorrect output - typeA.balance');
        assert.equal(typeBStruct.typeA.token, tokenAddress, 'run function incorrect output - typeA.token');
    });

    it('run AB function', async () => {
        let logs, hash, index, stakedFunction;
        let tokenAddress = '0xEAd8C52989b587B0c6a8478f8B6dd447E2fc8B1f';

        stakedFunction = await dtype.get(0, 'setStaked');

        ({logs} = await typeA.insert({balance: 10, token: tokenAddress}));
        ({hash, index} = logs[0].args);
        let stakedFunctionHash = await dtype.getTypeHash(stakedFunction.lang, stakedFunction.name);
        let data = await typeA.getByHash(hash);

        ({logs} = await dtype.run(stakedFunctionHash, [hash]));
        ({hash} = logs[0].args);
        typeBStruct = await typeB.getByHash(hash);

        assert.equal(typeBStruct.staked, 5, 'run function incorrect output - staked');
        assert.equal(typeBStruct.typeA.balance, 10, 'run function incorrect output - typeA.balance');
        assert.equal(typeBStruct.typeA.token, tokenAddress, 'run function incorrect output - typeA.token');
    });
});
