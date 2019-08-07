import {signMessage} from '@dtype/core';

export const parseAlias = (aliasContract, alias) => {
  const separator = `0x${alias.separator.charCodeAt(0).toString(16)}`;
  return aliasContract.getAliased(alias.dTypeIdentifier, separator, alias.name);
};

export const getAliased = async (dtypeContract, aliasContract, args) => {
  const dtype = await dtypeContract.getByHash(args.dTypeIdentifier);
  const alias = await aliasContract.getReverse(args.dTypeIdentifier, args.identifier);
  return {
    dtype: {identifier: args.dTypeIdentifier, name: dtype.name},
    alias: {
      identifier: args.identifier,
      name: alias.substring(1),
      separator: alias.substring(0, 1),
    },
  };
};

export const setAlias = async (dtypeContract, aliasContract, wallet, chainId, data) => {
  const separator = `0x${data.separator.charCodeAt(0).toString(16)}`;
  const {nonce} = (
    await aliasContract.getAliasedData(data.dTypeIdentifier, separator, data.name)
  );
  // TODO fix signature
  const signature = await signMessage(
    wallet,
    ['address', 'uint256', 'bytes32', 'bytes32', 'uint64', 'bytes1', 'string'],
    [
      dtypeContract.address,
      chainId,
      data.dTypeIdentifier,
      data.identifier,
      nonce,
      separator,
      data.name,
    ],
  );

  aliasContract.setAlias(
    data.dTypeIdentifier,
    separator,
    data.name,
    data.identifier,
    signature,
  );
};
