const dType = artifacts.require('dType.sol')
const testUtils = artifacts.require('TestUtils.sol')

const insertsBase = require('../data/dtypes_test.json');

let insertFunction = {
    name: 'add',
    types: ['uint256', 'uint256'],
    labels: ['a', 'b'],
    lang: 0,
    typeChoice: 5,
    hasOutput: true,
    contractAddress: '0xCd9492Cdae7E8F8B5a648c6E15c4005C4cd9028b',
    source: '0x0000000000000000000000000000000000000000000000000000000000000000',
    outputs: ['uint256'],
}

contract('dType', async (accounts) => {
    let dtypeContract, testUtilsContract;
    let typeHashes = [];

    it('deploy', async () => {
        dtypeContract = await dType.deployed({from: accounts[0]});
        testUtilsContract = await testUtils.deployed({from: accounts[0]});
    });

    it('signature', async () => {
        let isArray, functionRecord, fhash;
        let signature, signatureTest, hash, typeSignature;

        isArray = await dtypeContract.typeIsArray("[]");
        assert.equal(isArray, true);

        isArray = await dtypeContract.typeIsArray("TypeA[]");
        assert.equal(isArray, true);

        isArray = await dtypeContract.typeIsArray("string[]l");
        assert.equal(isArray, false);

        hash = await dtypeContract.getTypeHash(0, 'TypeA');
        typeSignature = await dtypeContract.getTypeSignature(hash);
        assert.equal(typeSignature, '(uint256,address)');

        hash = await dtypeContract.getTypeHash(0, 'TypeA[]');
        typeSignature = await dtypeContract.getTypeSignature(hash);
        assert.equal(typeSignature, '(uint256,address)[]');

        functionRecord = JSON.parse(JSON.stringify(insertFunction)); functionRecord.name = 'newF1';
        functionRecord.types = ['string[]'];
        functionRecord.labels = ['label'];
        await dtypeContract.insert(functionRecord);
        fhash = await dtypeContract.getTypeHash(0, 'newF1');
        signature = await dtypeContract.getSignature(fhash);
        signatureTest = await testUtilsContract.getSignature('newF1(string[])');
        assert.equal(signature, signatureTest, `newF1 signatures are not equal`);

        functionRecord = JSON.parse(JSON.stringify(insertFunction)); functionRecord.name = 'newF2';
        functionRecord.types = ['TypeA[]'];
        functionRecord.labels = ['label'];

        await dtypeContract.insert(functionRecord);
        fhash = await dtypeContract.getTypeHash(0, 'newF2');

        signature = await dtypeContract.getSignature(fhash);
        signatureTest = await testUtilsContract.getSignature('newF2((uint256,address)[])');
        assert.equal(signature, signatureTest, `newF2 signatures are not equal`);
    });

    it('insert', async () => {
        for (let i = 0; i < insertsBase.length; i++) {
            let dtype, typeHash, typesOnChain;

            typeHash = await dtypeContract.getTypeHash(insertsBase[i].lang, insertsBase[i].name);
            dtype = await dtypeContract.get(insertsBase[i].lang, insertsBase[i].name);
            sameStructs(insertsBase[i], dtype.data);

            typesOnChain = await dtypeContract.getTypes(typeHash);
            assert.sameMembers(typesOnChain, insertsBase[i].types, 'unexpected types');
            typeHashes.push(typeHash);
        }
    });

    it('insertFunction', async () => {
        let dtype, typeHash, typeOutputs;

        await dtypeContract.insert(insertFunction, {from: accounts[0]});

        typeHash = await dtypeContract.getTypeHash(insertFunction.lang, insertFunction.name);
        await dtypeContract.setOutputs(typeHash, insertFunction.outputs);

        dtype = await dtypeContract.get(insertFunction.lang, insertFunction.name);
        typeOutputs = await dtypeContract.getOutputs(typeHash);
        dtype.data.outputs = typeOutputs;
        sameStructs(insertFunction, dtype.data);

        let signature = await dtypeContract.getSignature(typeHash);
        let functionName = `${insertFunction.name}(${insertFunction.types.join(',')})`;
        let signatureTest = await testUtilsContract.getSignature(functionName);
        assert.equal(signature, signatureTest, `Signatures are not equal`);
    });

    it('update', async () => {
        let dtype;
        let newdType = Object.assign({}, insertsBase[0]);
        newdType.name = 'newname';
        newdType.types = [insertsBase[1].name];
        newdType.labels = ['label'];

        await dtypeContract.update(typeHashes[0], newdType, {from: accounts[0]});

        dtype = await dtypeContract.get(newdType.lang, newdType.name);
        assert.equal(dtype.data.name, newdType.name, 'wrong newName');
        assert.sameMembers(dtype.data.types, newdType.types, 'unexpected types');
    });

    it('remove', async () => {
        let typeHash;

        typeHash = await dtypeContract.getTypeHash(insertsBase[2].lang, insertsBase[2].name);
        assert.isOk(await dtypeContract.isType(typeHash), 'no dtype to remove');

        await dtypeContract.remove(typeHash);
        assert.isNotOk(await dtypeContract.isType(typeHash), 'dtype was not removed');
    });
});

function sameStructs(dtype1, dtype2) {
    Object.keys(dtype1).forEach((key) => {
        // console.log('sameStructs key', key);
        let method = 'equal';
        if (dtype1[key] instanceof Array) {
            method = 'sameMembers';
        }
        assert[method](
            dtype1[key],
            dtype2[key],
            `wrong ${key}, should be ${dtype1[key]} instead of ${dtype2[key]}`,
        );
    });
}
