const dType = artifacts.require('dType.sol')

let inserts = [
    {
        name: "uint256",
        types: ["0x0000000000000000000000000000000000000000000000000000000000000000"],
        lang: 0,
        isEvent: false,
        isFunction: false,
        hasOutput: false,
        contractAddress: "0xCd9492Cdae7E8F8B5a648c6E15c4005C4cd9028b",
        source: "0x0000000000000000000000000000000000000000000000000000000000000000",
    },
    {
        name: "int256",
        types: ["0x0000000000000000000000000000000000000000000000000000000000000000"],
        lang: 0,
        isEvent: false,
        isFunction: false,
        hasOutput: false,
        contractAddress: "0xCd9492Cdae7E8F8B5a648c6E15c4005C4cd9028b",
        source: "0x0000000000000000000000000000000000000000000000000000000000000000",
    },
    {
        name: "string",
        types: ["0x0000000000000000000000000000000000000000000000000000000000000000"],
        lang: 0,
        isEvent: false,
        isFunction: false,
        hasOutput: false,
        contractAddress: "0xCd9492Cdae7E8F8B5a648c6E15c4005C4cd9028b",
        source: "0x0000000000000000000000000000000000000000000000000000000000000000",
    },
    {
        name: "bytes32",
        types: ["0x0000000000000000000000000000000000000000000000000000000000000000"],
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
    types: [
        "0x0000000000000000000000000000000000000000000000000000000000000000",
    ],
    lang: 0,
    isEvent: false,
    isFunction: true,
    hasOutput: true,
    contractAddress: "0xCd9492Cdae7E8F8B5a648c6E15c4005C4cd9028b",
    source: "0x0000000000000000000000000000000000000000000000000000000000000000",
    outputs: [
        "0x0000000000000000000000000000000000000000000000000000000000000000"
    ],
}

contract('dType', async (accounts) => {
    let dtype;
    let typeHashes = [];

    it('deploy', async () => {
        dtype = await dType.deployed({from: accounts[0]});
    });

    it('insert', async () => {
        for (let i = 0; i < inserts.length; i++) {
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
            await dtype.insert(
                name, types, lang, isEvent, isFunction, hasOutput, contractAddress, source,
                {from: accounts[0]}
            );
            let struct = await dtype.getByIndex(i);
            // console.log('struct', struct);
            assert.equal(
                struct.atype.name,
                name,
                `wrong name, should be ${name} instead of ${struct.atype.name}`,
            );
            assert.equal(
                struct.atype.lang,
                lang,
                `wrong lang, should be ${lang} instead of ${struct.atype.lang}`,
            );
            assert.equal(
                struct.atype.isEvent,
                isEvent,
                `wrong isEvent, should be ${isEvent} instead of ${struct.atype.isEvent}`,
            );
            assert.equal(
                struct.atype.isFunction,
                isFunction,
                `wrong isFunction, should be ${isFunction} instead of ${struct.atype.isFunction}`,
            );
            assert.equal(
                struct.atype.hasOutput,
                hasOutput,
                `wrong hasOutput, should be ${hasOutput} instead of ${struct.atype.hasOutput}`,
            );
            assert.equal(
                struct.atype.contractAddress,
                contractAddress,
                `wrong contractAddress, should be ${contractAddress} instead of ${struct.atype.contractAddress}`,
            );
            assert.equal(
                struct.atype.source,
                source,
                `wrong source, should be ${source} instead of ${struct.atype.source}`,
            );

            let typesOnChain = await dtype.getTypes(struct.hash);
            assert.sameMembers(typesOnChain, types, 'unexpected types');
            typeHashes.push(struct.hash);
        }
    });

    it('insert', async () => {
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
        await dtype.insert(
            name, types, lang, isEvent, isFunction, hasOutput, contractAddress, source,
            {from: accounts[0]}
        );
        let struct = await dtype.getByIndex(await dtype.count() - 1);
        assert.equal(
            struct.atype.name,
            name,
            `wrong name, should be ${name} instead of ${struct.atype.name}`,
        );
        await dtype.setOutputs(struct.hash, outputs);
        assert.sameMembers(
            await dtype.getOutputs(struct.hash),
            outputs,
            `wrong outputs`,
        );
    });

    it('update', async () => {
        let newName = 'newname';
        let types = ['0x0000000000000000000000000000000000000000000000000000000000001111'];
        console.log('typeHashes', typeHashes);
        await dtype.update(typeHashes[0], newName, types, {from: accounts[0]});
        let struct = await dtype.getByHash(typeHashes[0]);
        assert.equal(struct.name, newName, 'wrong newName');
        assert.sameMembers(struct.types, types, 'unexpected types');
    });
});
