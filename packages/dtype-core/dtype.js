import {normalizeEthersObject} from './ethers-utils';
import {DTYPE_ROOT} from './constants';

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
      let typeHash = await contract.getTypeHash(dtype.lang, dtype.types[i].name);
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
