const dType = artifacts.require('dType.sol');
const typeAContract = artifacts.require('typeAContract.sol');
const typeAArray = artifacts.require('typeAArrayContract.sol');
const typeAAFunctions = artifacts.require('typeAAFunctions.sol');
const testUtils = artifacts.require('TestUtils.sol')


contract('typeAArray', async (accounts) => {
    let dtype, typeA, typeAA, typeAAF, testUtilsContract;

    it('deploy', async () => {
        dtype = await dType.deployed();
        typeA = await typeAContract.deployed();
        typeAA = await typeAArray.deployed();
        typeAAF = await typeAAFunctions.deployed();
        testUtilsContract = await testUtils.deployed();
    });

    it('run map', async () => {
        let logs, hash, index;
        let tokenAddress = '0xEAd8C52989b587B0c6a8478f8B6dd447E2fc8B1f';
        let data = [
            {balance: 10, token: tokenAddress},
            {balance: 5, token: tokenAddress},
        ];

        // Verify inserted typeA[]
        let typeAARecord = await dtype.get(0, 'TypeA[]');
        assert.equal(typeAARecord.data.contractAddress, typeAA.address, 'Contract address not correct');

        // Insert input data
        ({logs} = await typeAA.insert(data));
        ({hash, index} = logs[0].args);

        // Verify input data
        let mapHash = await dtype.getTypeHash(0, 'doubleBalances');
        let typeAAData = await typeAA.getByHash(hash);
        typeAAData.forEach((typeAData, i) => {
            assert.equal(typeAData.balance, data[i].balance, 'Balance not correct');
            assert.equal(typeAData.token, data[i].token, 'Token not correct');
        });

        // Verify signature for doubleBalances
        let signature = await dtype.getSignature(mapHash);
        let signatureTest = await testUtilsContract.getSignature('doubleBalances((uint256,address)[])');
        assert.equal(signature, signatureTest, `Signatures are not equal`);
        assert.equal('0x892b341b', signatureTest, `Signature is incorrect`);

        // Verify doubleBalances standalone
        let result = await typeAAF.doubleBalances(data);
        result.forEach((typeAData, i) => {
            assert.equal(typeAData.balance, data[i].balance * 2, 'Balance not doubled');
        });

        // Verify run
        ({logs} = await dtype.run(mapHash, [hash]));
        ({hash} = logs[0].args);
        typeAAResult = await typeAA.getByHash(hash);

        typeAAResult.forEach((typeAData, i) => {
            assert.equal(typeAData.balance, data[i].balance * 2, 'Balance not doubled');
            assert.equal(typeAData.token, data[i].token, 'Token incorrect');
        });
    });
});
