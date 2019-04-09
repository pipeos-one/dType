import {ethers} from 'ethers';
import {waitAsync} from './utils';
import {buildTypeAbi, typeDimensionsToString} from './dtype_utils';

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

export const getDataItem = async function(contract, hash) {
    let typeData = await contract.getByHash(hash);
    typeData.typeHash = hash;
    return normalizeEthersObject(typeData);
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

function setTypeName(type) {
    type.fullName = type.name + typeDimensionsToString(type.dimensions);
    return type;
}

export const buildStructAbi = async function(dtypeContract, typeHash, parentLabel, dimensions) {
    const dtype = await dtypeContract.getByHash(typeHash);
    const {length} = dtype.name.length;
    let abi = {};
    let types = dtype.types.concat(dtype.optionals).map(type => setTypeName(type));

    abi.name = parentLabel;

    if (types.length === 0) {
        abi.type = dtype.name + typeDimensionsToString(dimensions);
        return abi;
    }

    abi.type = dtype.name.substring(length - 2) === '[]' ? 'tuple[]' : 'tuple';
    abi.components = [];
    for (let i = 0; i < types.length; i++) {
        const hash = await dtypeContract.getTypeHash(dtype.lang, types[i].name);
        abi.components.push(await buildStructAbi(
            dtypeContract,
            hash,
            types[i].label,
            types[i].dimensions,
        ));
    }
    return abi;
};

export const buildDefaultItem = (dtype) => {
    let item = {};
    let types = dtype.types.concat(dtype.optionals).map(type => setTypeName(type));
    types.forEach((type, i) => {
        item[type.label] = defaults[type.fullName];
        if (type.dimensions.length > 0) item[type.label] = [];
        if (!item[type.label]) {
            const key = Object.keys(defaults).find(deftype => type.fullName.indexOf(deftype) > -1);
            if (key) item[type.label] = defaults[key];
            else item[type.label] = '';
        }
    });
    return item;
};

export const isEthersObj = (item) => {
    if (
        item instanceof Array
        && Object.keys(item).find(key => !Number(key) && Number(key) !== 0)
    ) {
        return true;
    }
    return false;
};

export const normalizeEthersObject = (item) => {
    if (!(item instanceof Object)) return item;
    if (item instanceof Object && item.toNumber) return item.toNumber();
    if (item instanceof Array && !isEthersObj(item)) {
        return item.map(value => normalizeEthersObject(value));
    }
    let obj = {};

    Object.keys(item)
        .filter(key => !Number(key) && Number(key) !== 0)
        .forEach((key) => {
            obj[key] = normalizeEthersObject(item[key]);
        });
    return obj;
};
