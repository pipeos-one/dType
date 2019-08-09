import {
  getContract,
  saveResource,
} from '@dtype/core';
import {
  AliasMeta,
  getAliased,
  setAlias,
} from '@dtype/alias';

const aliasStore = {
  namespaced: true,
  state: {
    provider: null,
    wallet: null,
    dtypeContract: null,
    alias: null,
    aliases: {},
  },
  mutations: {
    setProvider(state, provider) {
      state.provider = provider;
    },
    setWallet(state, wallet) {
      state.wallet = wallet;
    },
    setdType(state, dtypeContract) {
      state.dtypeContract = dtypeContract;
    },
    setAlias(state, alias) {
      state.alias = alias;
    },
    setAliased(state, {dtype, alias}) {
      if (!state.aliases[dtype.name]) {
        state.aliases[dtype.name] = {identifier: dtype.identifier};
      }
      if (!state.aliases[dtype.name][alias.separator]) {
        state.aliases[dtype.name][alias.separator] = {};
      }
      state.aliases[dtype.name][alias.separator][alias.name] = alias.identifier;
    },
  },
  actions: {
    setContract({commit, state}) {
      const chainId = String(state.provider.network.chainId);
      const aliasAddress = AliasMeta.networks[chainId].address;
      return getContract(
        aliasAddress,
        AliasMeta.abi,
        state.wallet,
      ).then((contract) => {
        commit('setAlias', contract);
      });
    },
    async saveResource({state}, {dTypeData, data, identifier}) {
      return saveResource(
        state.provider,
        state.wallet,
        state.dtypeContract,
        {dTypeData, data, identifier},
      );
    },
    async parseAlias({state}, alias) {
      const separator = `0x${alias.separator.charCodeAt(0).toString(16)}`;
      return state.alias.getAliased(alias.dTypeIdentifier, separator, alias.name);
    },
    async setAliased({state, commit}, args) {
      commit('setAliased', await getAliased(state.dtypeContract, state.alias, args));
    },
    async setAlias({state}, data) {
      setAlias(
        state.dtypeContract,
        state.alias,
        state.wallet,
        state.provider.network.chainId,
        data,
      );
    },
    watchAllAlias({dispatch}) {
      return dispatch('watchAliasSet');
    },
    removeWatchersAlias({state}) {
      return state.alias.removeAllListeners('AliasSet');
    },
    watchAliasSet({dispatch, state}) {
      const filter = {
        address: state.alias.address,
        topics: [state.alias.interface.events.AliasSet.topic],
        fromBlock: 0,
        toBlock: 'latest',
      };
      state.provider.getLogs(filter).then((logs) => {
        logs.forEach((log) => {
          log = state.alias.interface.parseLog(log);
          dispatch('setAliased', log.values);
        });
      });
      state.alias.on('AliasSet', (dTypeIdentifier, identifier) => {
        dispatch('setAliased', {dTypeIdentifier, identifier});
      });
    },
  },
};

export default aliasStore;
