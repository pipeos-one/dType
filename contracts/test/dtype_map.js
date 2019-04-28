const CT = require('./constants.js');

const dType = artifacts.require('dType.sol');
const typeALib = artifacts.require('typeALib.sol');
const typeAContract = artifacts.require('typeAContract.sol');
const typeAAFunctions = artifacts.require('typeAAFunctions.sol');
const testUtils = artifacts.require('TestUtils.sol')


contract('type HOFs', async (accounts) => {
    let dtype, typeA, typeAL, typeAA, typeAAF, testUtilsContract;
    let tokenAddress = '0xEAd8C52989b587B0c6a8478f8B6dd447E2fc8B1f';
    let data = [
        {balance: 10, token: tokenAddress},
        {balance: 5, token: tokenAddress},
    ];

    it('deploy', async () => {
        dtype = await dType.deployed();
        typeAL = await typeALib.deployed();
        typeA = await typeAContract.deployed();
        typeAAF = await typeAAFunctions.deployed();
        testUtilsContract = await testUtils.deployed();
    });

    it('run map', async () => {
        let logs, hash, index;

        let mapHash = await dtype.getTypeHash(0, 'doubleBalances');

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
    });

    it('pipe', async() => {
        let dataHash, funcHash, result;
        let {logs} = await typeA.insert(data[0]);
        dataHash = logs[0].args.hash;

        funcHash = await dtype.getTypeHash(0, 'double');
        result = await dtype.pipeView([dataHash], [funcHash, funcHash, funcHash], CT.EMPTY_BYTES);
        result = await typeAL.structureBytes(result);

        assert.equal(result.balance, data[0].balance * (2 ** 3));
    });
});
