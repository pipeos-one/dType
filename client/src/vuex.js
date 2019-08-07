import {
  getProvider,
  getContract,
  getTypeStruct,
  getdTypeRoot,
  getTypes,
  dTypeMeta,
  saveResource,
} from '@dtype/core';
import {
  AliasMeta,
  getAliased,
  setAlias,
} from '@dtype/alias';
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const dTypeStore = new Vuex.Store({
  state: {
    provider: null,
    wallet: null,
    contract: null,
    dtype: null,
    dtypes: [],
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
    setContract(state, contract) {
      state.contract = contract;
    },
    setType(state, dtype) {
      state.dtype = dtype;
    },
    setTypes(state, dtypes) {
      state.dtypes = dtypes;
    },
    addType(state, dtype) {
      state.dtypes.push(dtype);
    },
    updateType(state, index, dtype) {
      // We have a LogUpdate in remove(), this can log an empty struct
      if (dtype && state.dtypes[index]) {
        Object.assign(state.dtypes[index], dtype);
      }
    },
    removeType(state, index) {
      state.dtypes.splice(index, 1);
    },
    // Alias
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
    setProvider({commit}) {
      return getProvider().then(({provider, wallet}) => {
        commit('setProvider', provider);
        commit('setWallet', wallet);
      });
    },
    setContract({commit, state}) {
      const chainId = String(state.provider.network.chainId);
      const contractAddress = dTypeMeta.networks[chainId].address;
      getContract(
        contractAddress,
        dTypeMeta.abi,
        state.wallet,
      ).then((contract) => {
        commit('setContract', contract);
      });

      const aliasAddress = AliasMeta.networks[chainId].address;
      getContract(
        aliasAddress,
        AliasMeta.abi,
        state.wallet,
      ).then((contract) => {
        commit('setAlias', contract);
      });
    },
    async getTypeStruct({state}, {lang, name, hash}) {
      return getTypeStruct(state.contract, {lang, name, hash});
    },
    async setTypes({commit, state}) {
      const data = await getdTypeRoot(state.contract);
      commit('setType', data);
      getTypes(state.contract, struct => commit('addType', struct));
    },
    insertType({state}, dtype) {
      console.log('insert dtype', JSON.stringify(dtype));
      return state.contract.insert(dtype)
        .then(tx => tx.wait(2))
        .then(console.log);
    },
    insertBatchType({dispatch}, dtypeArray) {
      console.log('batchInsert', dtypeArray);
      for (let i = 0; i < dtypeArray.length; i++) {
        dispatch('insertType', dtypeArray[i]);
      }
    },
    updateType({state}, dtype) {
      console.log('update dtype', JSON.stringify(dtype));
      return state.contract.update(dtype.typeHash, dtype)
        .then(tx => tx.wait(2))
        .then(console.log);
    },
    removeType({state}, dtype) {
      console.log('delete dtype', JSON.stringify(dtype));
      return state.contract.remove(dtype.typeHash)
        .then(tx => tx.wait(2))
        .then(console.log);
    },
    watchAll({dispatch}) {
      return dispatch('watchInsert').then(() => {
        dispatch('watchUpdate');
      }).then(() => {
        dispatch('watchRemove');
      });
    },
    removeWatchers({state}) {
      return state.contract.removeAllListeners('LogNew')
        .removeAllListeners('LogUpdate')
        .removeAllListeners('LogRemove');
    },
    watchInsert({dispatch, commit, state}) {
      state.contract.on('LogNew', (typeHash, index) => {
        console.log('LogNew', typeHash, index);
        const typeIndex = state.dtypes.findIndex(dtype => dtype.typeHash === typeHash);
        if (typeIndex !== -1) return;
        dispatch('getTypeStruct', {hash: typeHash}).then((struct) => {
          commit('addType', struct);
        });
      });
    },
    watchUpdate({dispatch, commit, state}) {
      state.contract.on('LogUpdate', (typeHash, index) => {
        console.log('LogUpdate', typeHash, index, index.toNumber());
        const typeIndex = state.dtypes.findIndex(dtype => dtype.typeHash === typeHash);

        if (typeIndex === -1) return;
        dispatch('getTypeStruct', {hash: typeHash}).then((struct) => {
          commit('updateType', typeIndex, struct);
        });
      });
    },
    watchRemove({commit, state}) {
      state.contract.on('LogRemove', (typeHash) => {
        console.log('LogRemove', typeHash);
        const typeIndex = state.dtypes.findIndex(dtype => dtype.typeHash === typeHash);
        if (typeIndex > -1) {
          commit('removeType', typeIndex);
        }
      });
    },
    async saveResource({state}, {dTypeData, data, identifier}) {
      return saveResource(
        state.provider,
        state.wallet,
        state.contract,
        {dTypeData, data, identifier},
      );
    },
    async parseAlias({state}, alias) {
      const separator = `0x${alias.separator.charCodeAt(0).toString(16)}`;
      return state.alias.getAliased(alias.dTypeIdentifier, separator, alias.name);
    },
    async setAliased({state, commit}, args) {
      commit('setAliased', await getAliased(state.contract, state.alias, args));
    },
    async setAlias({state}, data) {
      setAlias(
        state.contract,
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
        console.log('AliasSet', dTypeIdentifier, identifier);
        dispatch('setAliased', {dTypeIdentifier, identifier});
      });
    },
  },
});

export default dTypeStore;
