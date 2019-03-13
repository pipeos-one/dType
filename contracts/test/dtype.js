const dType = artifacts.require('dType.sol')

let inserts = [
    [
        'uint256',
        ['0x0000000000000000000000000000000000000000000000000000000000000000'],
        '0xCd9492Cdae7E8F8B5a648c6E15c4005C4cd9028b',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
    ],
    [
        'bytes32',
        ['0x0000000000000000000000000000000000000000000000000000000000000000'],
        '0xCd9492Cdae7E8F8B5a648c6E15c4005C4cd9028b',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
    ],
]

contract('dType', async (accounts) => {
    let dtype;
    let typeHash;

    it('deploy', async () => {
        dtype = await dType.deployed({from: accounts[0]});
    });

    it('insert', async () => {
        await dtype.insert(...inserts[0], {from: accounts[0]});
        let struct = await dtype.getByIndex(0);
        assert.equal(struct.atype.name, inserts[0][0]);

        let types = await dtype.getTypes(struct.hash);
        assert.sameMembers(types, inserts[0][1], 'unexpected types');
        typeHash = struct.hash;
    });

    it('update', async () => {
        let newName = 'newname';
        let types = ['0x0000000000000000000000000000000000000000000000000000000000001111'];
        await dtype.update(typeHash, newName, types, {from: accounts[0]});
        let struct = await dtype.getByHash(typeHash);
        console.log('struct', struct);
        assert.equal(struct.name, newName);
        assert.sameMembers(struct.types, types, 'unexpected types');
    });
});
