const dType = artifacts.require('dType.sol')
const testUtils = artifacts.require('TestUtils.sol')

let inserts = [
    {
        name: 'uint256',
        types: [],
        lang: 0,
        isEvent: false,
        isFunction: false,
        hasOutput: false,
        contractAddress: '0xCd9492Cdae7E8F8B5a648c6E15c4005C4cd9028b',
        source: '0x0000000000000000000000000000000000000000000000000000000000000000',
    },
    {
        name: 'int256',
        types: [],
        lang: 0,
        isEvent: false,
        isFunction: false,
        hasOutput: false,
        contractAddress: '0xCd9492Cdae7E8F8B5a648c6E15c4005C4cd9028b',
        source: '0x0000000000000000000000000000000000000000000000000000000000000000',
    },
    {
        name: 'string',
        types: [],
        lang: 0,
        isEvent: false,
        isFunction: false,
        hasOutput: false,
        contractAddress: '0xCd9492Cdae7E8F8B5a648c6E15c4005C4cd9028b',
        source: '0x0000000000000000000000000000000000000000000000000000000000000000',
    },
    {
        name: 'bytes32',
        types: [],
        lang: 0,
        isEvent: false,
        isFunction: false,
        hasOutput: false,
        contractAddress: '0xCd9492Cdae7E8F8B5a648c6E15c4005C4cd9028b',
        source: '0x0000000000000000000000000000000000000000000000000000000000000000',
    },
]

let insertFunction = {
    name: 'add',
    types: ['uint256', 'uint256'],
    lang: 0,
    isEvent: false,
    isFunction: true,
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

    it('insert', async () => {
        for (let i = 0; i < inserts.length; i++) {
            let dtype, typeHash, typesOnChain;

            await dtypeContract.insert(inserts[i], {from: accounts[0]});

            ({dtype, typeHash} = await dtypeContract.getByIndex(i));
            // console.log('dtype, typeHash', dtype, typeHash);
            sameStructs(inserts[i], dtype.data);

            dtype = await dtypeContract.get(inserts[i].lang,inserts[i]. name);
            sameStructs(inserts[i], dtype.data);

            typesOnChain = await dtypeContract.getTypes(typeHash);
            assert.sameMembers(typesOnChain, inserts[i].types, 'unexpected types');
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
        let newdType = Object.assign({}, inserts[0]);
        newdType.name = 'newname';
        newdType.types = [inserts[1].name];
        // console.log('typeHashes', typeHashes);

        await dtypeContract.update(typeHashes[0], newdType, {from: accounts[0]});

        dtype = await dtypeContract.get(newdType.lang, newdType.name);
        assert.equal(dtype.data.name, newdType.name, 'wrong newName');
        assert.sameMembers(dtype.data.types, newdType.types, 'unexpected types');
    });

    it('remove', async () => {
        let typeHash;

        typeHash = await dtypeContract.getTypeHash(inserts[2].lang, inserts[2].name);
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
