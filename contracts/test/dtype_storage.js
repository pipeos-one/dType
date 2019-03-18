const dType = artifacts.require('dType.sol')
const TypeStorage = artifacts.require('TypeStorage.sol')

contract('TypeStorage', async (accounts) => {
    let dtypeStorage;
    let data = {balance: 10, owner: "0xca35b7d915458ef540ade6068dfe2f44e8fa733c"};
    let data2 = {balance: 20, owner: "0xca35b7d915458ef540ade6068dfe2f44e8fa733c"};
    let hash, hash2;

    it('deploy', async () => {
        dtypeStorage = await TypeStorage.deployed({from: accounts[0]});
    });

    it('insert', async () => {
        await dtypeStorage.insert(data);
        hash = await dtypeStorage.typeIndex(0);
        let ddata = await dtypeStorage.get(hash);
        console.log('ddata', ddata);
    });

    it('update', async () => {
        await dtypeStorage.update(hash, data2);
        hash2 = await dtypeStorage.typeIndex(0);
    });

    it('remove', async () => {
        await dtypeStorage.remove(hash2);
    });
});
