import {ethers} from 'ethers';

export const waitAsync = async function(delay) {
    return new Promise(resolve => setTimeout(resolve, delay));
};

export const getProvider = async () => {
    // Metamask
    let provider = new ethers.providers.Web3Provider(window.web3.currentProvider);
    let wallet = provider.getSigner();

    await waitAsync(1000);

    // Temporary fix for Ganache
    if (provider.network.chainId === 5777) {
        const url = 'http://192.168.1.140:8545';
        provider = new ethers.providers.JsonRpcProvider(url);
        wallet = provider.getSigner(0);
        await waitAsync(1000);
    }
    return {provider, wallet};
};

export const getContract = async (address, abi, wallet) => {
    const contract = new ethers.Contract(address, abi, wallet);
    // await waitAsync(1000);
    return contract;
};

export const signMessage = (wallet, types, values) => {
    console.log('signMessage', types, values);
    const msg = ethers.utils.solidityPack(types, values);
    return wallet.signMessage(msg);
};
