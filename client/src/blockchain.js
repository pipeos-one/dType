import {ethers} from 'ethers';
import {waitAsync} from './utils';
import {buildTypeAbi} from './dtype_utils';

const defaults = {
    '[]': [],
    int: 0,
    string: '',
    bool: false,
    address: '0x0000000000000000000000000000000000000000',
    bytes32: '0x0000000000000000000000000000000000000000000000000000000000000000',
    bytes: '0x00',
};

export const getProvider = async function(DType) {
    // Metamask
    let provider = new ethers.providers.Web3Provider(window.web3.currentProvider);
    let wallet = new ethers.Wallet(
        DType.from.privateKey,
        provider,
    );

    await waitAsync(1000);

    // Temporary fix for Ganache
    if (provider.network.chainId === 5777) {
        const url = 'http://localhost:8545';
        provider = new ethers.providers.JsonRpcProvider(url);
        wallet = provider.getSigner(0);
        await waitAsync(1000);
    }
    return {provider, wallet};
};

export const getContract = async function(address, abi, wallet) {
    const contract = new ethers.Contract(address, abi, wallet);
    // await waitAsync(1000);
    return contract;
};

export const getDataItem = async function(contract, hash, index) {
    let typeData = await contract.getByHash(hash);
    typeData.index = index;
    typeData.typeHash = hash;
    return typeData;
};

export const getDataItems = async function(contract, callback) {
    let hash;
    let typeData;
    const count = await contract.count();

    for (let i = 0; i < count; i++) {
        hash = await contract.typeIndex(i);
        typeData = await getDataItem(contract, hash, i);
        callback(typeData);
    }
};

export const getDataItemsByTypeHash = async function(dtypeContract, wallet, typeStruct, callback) {
    const dtypeAbi = await buildStructAbi(dtypeContract, typeStruct.typeHash);
    const abi = buildTypeAbi(dtypeAbi);
    const typeContract = await getContract(
        typeStruct.contractAddress,
        abi,
        wallet,
    );

    getDataItems(typeContract, callback);
};

export const buildStructAbi = async function(dtypeContract, typeHash, parentLabel) {
    const dtype = await dtypeContract.getByHash(typeHash);
    const {length} = dtype.data.name.length;
    let abi = {};

    abi.name = parentLabel;

    if (dtype.data.types.length === 0) {
        abi.type = dtype.data.name;
        return abi;
    }

    abi.type = dtype.data.name.substring(length - 2) === '[]' ? 'tuple[]' : 'tuple';
    abi.components = [];
    for (let i = 0; i < dtype.data.types.length; i++) {
        const hash = await dtypeContract.getTypeHash(dtype.data.lang, dtype.data.types[i]);
        abi.components.push(await buildStructAbi(
            dtypeContract,
            hash,
            dtype.data.labels[i],
        ));
    }
    return abi;
};

export const buildDefaultItem = (dtype) => {
    let item = {};
    dtype.types.forEach((type, i) => {
        item[dtype.labels[i]] = defaults[type];
        if (!item[dtype.labels[i]]) {
            const key = Object.keys(defaults).find(deftype => type.indexOf(deftype) > -1);
            if (key) item[dtype.labels[i]] = defaults[key];
            else item[dtype.labels[i]] = '';
        }
    });
    return item;
};

export const normalizeEthersObject = (item) => {
    let obj = {};

    Object.keys(item)
        .filter(key => !Number(key) && Number(key) !== 0)
        .forEach((key) => {
            if (item[key] instanceof Object && item[key].toNumber) {
                obj[key] = item[key].toNumber();
            } else if (
                item[key] instanceof Object &&
                !(item[key] instanceof Array) &&
                !item[key].toNumber
            ) {
                obj[key] = normalizeEthersObject(item[key]);
            } else {
                obj[key] = item[key];
            }
        });
    return obj;
};
