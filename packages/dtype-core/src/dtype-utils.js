import {DEFAULTS} from './constants';
import {StorageBase} from './metadata';
import {getContract} from './blockchain';
import {normalizeEthersObject} from './ethers-utils';

export const typeDimensionsToString = (dimensions) => {
  return dimensions.reduce((str, dim) => `${str}[${Number(dim) ? dim : ''}]`, '');
};

export const getDataItem = async (contract, hash) => {
  const typeData = await contract.getByHash(hash);
  typeData.typeHash = hash;
  return normalizeEthersObject(typeData);
};

export const getDataItems = async (contract, callback) => {
  let hash;
  let typeData;
  const count = await contract.count();

  for (let i = 0; i < count; i++) {
    hash = await contract.typeIndex(i);
    typeData = await getDataItem(contract, hash, i);
    callback(typeData);
  }
};

const setTypeName = (type) => {
  type.fullName = type.name + typeDimensionsToString(type.dimensions);
  return type;
};

export const buildStructAbi = async (dtypeContract, typeHash, parentLabel, dimensions) => {
  const dtype = await dtypeContract.getByHash(typeHash);
  const {length} = dtype.name.length;
  const abi = {};
  const types = dtype.types.concat(dtype.optionals).map(type => setTypeName(type));

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

export const buildStorageAbi = async (dtypeContract, typeHash, structLabel = 'data') => {
  const common = {constant: false, inputs: [], outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function'};
  const hash = {name: 'hash', type: 'bytes32'};
  const index = {name: 'index', type: 'uint256'};
  const counter = {name: 'counter', type: 'uint256'};

  const dataStruct = await buildStructAbi(dtypeContract, typeHash, structLabel);
  const insert = Object.assign({name: 'insert'}, common);
  insert.inputs = [dataStruct];
  insert.outputs = [hash];
  const update = Object.assign({name: 'update'}, common);
  update.inputs = [hash, dataStruct];
  update.outputs = [hash];
  const remove = Object.assign({name: 'remove'}, common);
  remove.inputs = [hash];
  remove.outputs = [index];
  const getByHash = Object.assign({name: 'getByHash'}, common);
  getByHash.constant = true;
  getByHash.inputs = [hash];
  getByHash.outputs = [dataStruct];
  const count = Object.assign({name: 'count'}, common);
  count.constant = true;
  count.outputs = [counter];
  return [insert, getByHash, remove, getByHash].concat(StorageBase.abi);
};

export const buildDefaultItem = (dtype) => {
  const item = {};
  const types = dtype.types.concat(dtype.optionals).map(type => setTypeName(type));
  types.forEach((type) => {
    item[type.label] = DEFAULTS[type.fullName];
    if (type.dimensions.length > 0) item[type.label] = [];
    if (!item[type.label]) {
      const key = Object.keys(DEFAULTS).find(deftype => type.fullName.indexOf(deftype) > -1);
      if (key) item[type.label] = DEFAULTS[key];
      else item[type.label] = '';
    }
  });
  return item;
};

export const search = (dtypes, substr) => {
  return dtypes.filter(dtype => dtype.name.match(substr));
};

export const getDataItemsByTypeHash = async (dtypeContract, wallet, typeStruct, callback) => {
  const abi = await buildStorageAbi(dtypeContract, typeStruct.typeHash);
  const typeContract = await getContract(
    typeStruct.contractAddress,
    abi,
    wallet,
  );

  getDataItems(typeContract, callback);
};

export const getDataItemByTypeHash = async (dtypeContract, wallet, typeStruct, dataIdentifier) => {
  const abi = await buildStorageAbi(dtypeContract, typeStruct.typeHash);
  const typeContract = await getContract(
    typeStruct.contractAddress,
    abi,
    wallet,
  );

  return getDataItem(typeContract, dataIdentifier);
};

export const getUIPackage = async (packageName) => {
  const pack = await import(
    /* webpackChunkName: 'dynamicComponent' */
    /* webpackMode: "lazy" */
    `../../../client/node_modules/@dtype/${packageName}-ui/dist/dtype-${packageName}-ui.common.js`
  ).catch(console.log);

  if (pack) {
    await import(
      /* webpackChunkName: 'dynamicComponent' */
      /* webpackMode: "lazy" */
      `../../../client/node_modules/@dtype/${packageName}-ui/dist/dtype-${packageName}-ui.css`
    ).catch(console.log);
  }

  return pack;
};
