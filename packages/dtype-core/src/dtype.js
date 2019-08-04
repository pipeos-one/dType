import {getContract} from './blockchain';
import {normalizeEthersObject} from './ethers-utils';
import {DTYPE_ROOT} from './constants';
import {buildStorageAbi} from './dtype-utils';

export const getTypeStruct = async (contract, {lang, name, hash}) => {
  let struct;
  if (!hash) {
    hash = await contract.getTypeHash(lang, name);
  }
  struct = await contract.getByHash(hash);
  struct.typeHash = hash;
  return normalizeEthersObject(struct);
};

export const getdTypeRoot = async (contract) => {
  const hash = await contract.getTypeHash(0, DTYPE_ROOT);
  const dtype = await getTypeStruct(contract, {hash});

  dtype.typesHashes = [];
  for (let i = 0; i < dtype.types.length; i++) {
    const typeHash = await contract.getTypeHash(dtype.lang, dtype.types[i].name);
    dtype.typesHashes.push(typeHash);
  }
  return dtype;
};

export const getTypes = async (contract, callback) => {
  const hashes = await contract.getIndex();
  for (let i = 0; i < hashes.length; i++) {
    const dtype = await getTypeStruct(contract, {hash: hashes[i]});
    callback(dtype);
  }
};

export const saveResource = async (provider, wallet, dtypeContract, obj) => {
  const {dTypeData, data, identifier} = obj;
  const abi = await buildStorageAbi(dtypeContract, dTypeData.typeHash);
  const contract = await getContract(
    dTypeData.contractAddress,
    abi,
    wallet,
  );
  // TODO: differentiate update from insert - check if identifier is bytes32(0) or not
  // const txn = await contract.update(identifier, data);
  const txn = await contract.insert(data);
  const receipt = await provider.waitForTransaction(txn.hash);
  // TODO: proper generalized log parsing for any storage contract
  return receipt.logs[0].topics[1];
};
