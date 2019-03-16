const dType = artifacts.require('dType.sol')

let inserts = [
    {
        name: "uint256",
        types: [],
        lang: 0,
        isEvent: false,
        isFunction: false,
        hasOutput: false,
        contractAddress: "0xCd9492Cdae7E8F8B5a648c6E15c4005C4cd9028b",
        source: "0x0000000000000000000000000000000000000000000000000000000000000000",
    },
    {
        name: "int256",
        types: [],
        lang: 0,
        isEvent: false,
        isFunction: false,
        hasOutput: false,
        contractAddress: "0xCd9492Cdae7E8F8B5a648c6E15c4005C4cd9028b",
        source: "0x0000000000000000000000000000000000000000000000000000000000000000",
    },
    {
        name: "string",
        types: [],
        lang: 0,
        isEvent: false,
        isFunction: false,
        hasOutput: false,
        contractAddress: "0xCd9492Cdae7E8F8B5a648c6E15c4005C4cd9028b",
        source: "0x0000000000000000000000000000000000000000000000000000000000000000",
    },
    {
        name: "bytes32",
        types: [],
        lang: 0,
        isEvent: false,
        isFunction: false,
        hasOutput: false,
        contractAddress: "0xCd9492Cdae7E8F8B5a648c6E15c4005C4cd9028b",
        source: "0x0000000000000000000000000000000000000000000000000000000000000000",
    },
]

let insertWithOutput = {
    name: "mapping",
    types: [],
    lang: 0,
    isEvent: false,
    isFunction: true,
    hasOutput: true,
    contractAddress: "0xCd9492Cdae7E8F8B5a648c6E15c4005C4cd9028b",
    source: "0x0000000000000000000000000000000000000000000000000000000000000000",
    outputs: ["uint256"],
}

contract('dType', async (accounts) => {
    let dtypeContract;
    let typeHashes = [];

    it('deploy', async () => {
        dtypeContract = await dType.deployed({from: accounts[0]});
    });

    it('insert', async () => {
        for (let i = 0; i < inserts.length; i++) {
            let dtype, typeHash, typesOnChain;
            let {
                name,
                types,
                lang,
                isEvent,
                isFunction,
                hasOutput,
                contractAddress,
                source,
            } = inserts[i];
            await dtypeContract.insert(
                lang, name, types, isEvent, isFunction, hasOutput, contractAddress, source,
                {from: accounts[0]}
            );

            ({dtype, typeHash} = await dtypeContract.getByIndex(i));
            // console.log('dtype, typeHash', dtype, typeHash);
            sameStructs(inserts[i], dtype);

            dtype = await dtypeContract.get(lang, name);
            sameStructs(inserts[i], dtype);

            typesOnChain = await dtypeContract.getTypes(typeHash);
            assert.sameMembers(typesOnChain, types, 'unexpected types');
            typeHashes.push(typeHash);
        }
    });

    it('insertWithOutput', async () => {
        let dtype, typeHash, typeOutputs;
        let {
            name,
            types,
            lang,
            isEvent,
            isFunction,
            hasOutput,
            contractAddress,
            source,
            outputs
        } = insertWithOutput;
        await dtypeContract.insert(
            lang, name, types, isEvent, isFunction, hasOutput, contractAddress, source,
            {from: accounts[0]}
        );

        typeHash = await dtypeContract.getTypeHash(lang, name);
        await dtypeContract.setOutputs(typeHash, outputs);

        dtype = await dtypeContract.get(lang, name);
        typeOutputs = await dtypeContract.getOutputs(typeHash);
        dtype.outputs = typeOutputs;
        sameStructs(insertWithOutput, dtype);
    });

    it('update', async () => {
        let dtype;
        let newName = 'newname';
        let newTypes = [inserts[1].name];
        // console.log('typeHashes', typeHashes);

        await dtypeContract.update(typeHashes[0], newName, newTypes, {from: accounts[0]});

        dtype = await dtypeContract.get(inserts[1].lang, newName);
        assert.equal(dtype.name, newName, 'wrong newName');
        assert.sameMembers(dtype.types, newTypes, 'unexpected types');
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
