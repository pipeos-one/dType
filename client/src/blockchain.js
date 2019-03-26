import {ethers} from 'ethers';
import {waitAsync} from './utils';

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

export const buildStructAbi = async function(dtypeContract, typeHash, parentLabel) {
    const dtype = await dtypeContract.getByHash(typeHash);
    const {length} = dtype.data.name.length;
    let abi = {};

    if (dtype.data.types.length === 0) {
        abi.name = parentLabel;
        abi.type = dtype.data.name;
        return abi;
    }
    abi.name = dtype.data.name;
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
