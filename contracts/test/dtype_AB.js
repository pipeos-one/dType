const dType = artifacts.require('dType.sol')
const typeAContract = artifacts.require('typeAContract.sol')
const typeBContract = artifacts.require('typeBContract.sol')
const typeABLogic = artifacts.require('typeABLogic.sol')
const testUtils = artifacts.require('TestUtils.sol');

contract('dTypeAB', async (accounts) => {
    let dtype, typeA, typeB, typeAB, utils;
    let typeuint256 = {
        name: 'uint256',
        lang: 0,
        types: [],
        isEvent: false,
        isFunction: false,
        hasOutput: false,
        source: '0x0',
        contractAddress: '0x0000000000000000000000000000000000000000',
    }
    let typeaddress = {
        name: 'address',
        lang: 0,
        types: [],
        isEvent: false,
        isFunction: false,
        hasOutput: false,
        source: '0x0',
        contractAddress: '0x0000000000000000000000000000000000000000',
    }
    let typeAStruct = {
        name: 'typeA',
        lang: 0,
        types: ['uint256', 'address'],
        isEvent: false,
        isFunction: false,
        hasOutput: false,
        source: '0x0',
    }
    let typeBStruct = {
        name: 'typeB',
        lang: 0,
        types: ['uint256', 'typeA'],
        isEvent: false,
        isFunction: false,
        hasOutput: false,
        source: '0x0',
    }
    let stakedFunction = {
        name: 'setStaked',
        lang: 0,
        types: ['typeA'],
        isEvent: false,
        isFunction: true,
        hasOutput: true,
        source: '0x0',
        outputs: ['typeB'],
    }

    it('deploy', async () => {
        dtype = await dType.deployed({from: accounts[0]});
        typeA = await typeAContract.deployed({from: accounts[0]});
        typeB = await typeBContract.deployed({from: accounts[0]});
        typeAB = await typeABLogic.deployed({from: accounts[0]});
        utils = await testUtils.deployed({from: accounts[0]});
    });

    it('insert dtype AB', async () => {
        let logs, hash, index;

        typeAStruct.contractAddress = typeA.address;
        typeBStruct.contractAddress = typeB.address;
        stakedFunction.contractAddress = typeAB.address;
        await dtype.insert(typeuint256);
        await dtype.insert(typeaddress);

        ({logs} = await dtype.insert(typeAStruct));
        ({hash, index} = logs[0].args);
        typeAData = await dtype.getByHash(hash);
        assert.equal(typeA.address, typeAData.data.contractAddress);

        await dtype.insert(typeBStruct);

        ({logs} = await dtype.insert(stakedFunction));
        ({hash, index} = logs[0].args);
        await dtype.setOutputs(hash, stakedFunction.outputs);
    });

    it('run AB function', async () => {
        let logs, hash, index;
        let tokenAddress = '0xEAd8C52989b587B0c6a8478f8B6dd447E2fc8B1f';

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
