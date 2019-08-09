import {
  getProvider,
  getContract,
  getTypeStruct,
  getdTypeRoot,
  getTypes,
  dTypeMeta,
} from '@dtype/core';

const dTypeStore = {
  namespaced: true,
  state: {
    provider: null,
    wallet: null,
    contract: null,
    dtype: null,
    dtypes: [],
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
  },
};

export default dTypeStore;
