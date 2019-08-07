import {ethers} from 'ethers';

export const waitAsync = async function(delay) {
  return new Promise(resolve => setTimeout(resolve, delay));
};

export const getProvider = async () => {
  // Metamask
  let provider = new ethers.providers.Web3Provider(window.web3.currentProvider);
  let wallet = provider.getSigner();

  // wait for network to load
  await provider.getNetwork();

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
