<template>
    <div>
        <dTypeView :dtype="typeStruct"
            :parentHeaders="dtypeHeaders"
            :dtypes="dtypes"
        />
        <dTypeBrowse
            :headers="headers"
            :items="items"
            :defaultItem="defaultItem"
            v-on:insert="insert"
            v-on:batchInsert="batchInsert"
            v-on:update="update"
            v-on:remove="remove"
        />
    </div>
</template>

<script>
import {mapState} from 'vuex';
import {
    getContract,
    buildDefaultItem,
    getDataItem,
    getDataItems,
    buildStorageAbi,
    typeDimensionsToString,
} from '@dtype/core';
import dTypeBrowse from '../components/dTypeBrowse';
import dTypeView from '../components/dTypeView';
import {EMPTY_ADDRESS} from '../constants_utils';

export default {
    props: ['hash', 'lang', 'name'],
    components: {
        dTypeBrowse,
        dTypeView,
    },
    data: () => ({
        typeContract: null,
        typeStruct: null,
        items: [],
        headers: [],
        dtypeHeaders: [],
        isRoot: false,
        defaultItem: {},
    }),
    computed: mapState({
        contract: 'contract',
        dtype: 'dtype',
        dtypes: 'dtypes',
    }),
    destroyed() {
        this.teardown();
    },
    watch: {
        dtype() {
            this.teardown();
            this.setData();
        },
        hash() {
            this.teardown();
            this.setData();
        },
        name() {
            this.teardown();
            this.setData();
        },
        contract() {
            this.teardown();
            if (!this.dtype) return;
            this.setData();
        },
    },
    methods: {
        async setData() {
            await this.setContract();
        },
        async setContract() {
            this.dtypeHeaders = this.getHeaders(this.dtype);

            if (this.hash === this.dtype.typeHash || this.name === this.dtype.name) {
                console.log('isRoot');
                this.isRoot = true;
                this.typeContract = this.contract;
                this.typeStruct = this.dtype;
                this.items = this.dtypes;
                this.headers = this.dtypeHeaders;
            } else {
                console.log('not Root');
                let {hash} = this;
                if (this.name) {
                    hash = await this.contract.getTypeHash(this.lang, this.name);
                }
                this.typeStruct = await this.$store.dispatch('getTypeStruct', {hash});
                this.typeContract = null;
                this.items = [];
                this.headers = this.getHeaders(this.typeStruct);
                this.isRoot = false;

                if (
                    this.typeStruct.contractAddress &&
                    this.typeStruct.contractAddress !== EMPTY_ADDRESS
                ) {
                    const abi = await buildStorageAbi(this.contract, this.typeStruct.typeHash);
                    this.typeContract = await getContract(
                        this.typeStruct.contractAddress,
                        abi,
                        this.$store.state.wallet,
                    );

                    getDataItems(this.typeContract, (dataItem) => {
                        this.items.push(dataItem);
                    });
                    this.watchAll();
                }
            }
            this.defaultItem = buildDefaultItem(this.typeStruct);
        },
        async watchAll() {
            this.typeContract.on('LogNew', async (typeHash, index) => {
                console.log('LogNew Data', typeHash, index);
                const typeIndex = this.items.findIndex(dtype => dtype.typeHash === typeHash);

                if (typeIndex !== -1) return;
                const typeData = await getDataItem(this.typeContract, typeHash, index);
                this.items.push(typeData);
            });
            this.typeContract.on('LogUpdate', async (typeHash, index) => {
                console.log('LogUpdate  Data', typeHash, index, index.toNumber());
                const typeIndex = this.items.findIndex(dtype => dtype.typeHash === typeHash);

                if (typeIndex === -1) return;
                const typeData = await getDataItem(this.typeContract, typeHash, index);
                if (typeData && this.items[index]) {
                    Object.assign(this.items[index], typeData);
                }
            });
            this.typeContract.on('LogRemove', async (typeHash) => {
                console.log('LogRemove Data', typeHash);
                const typeIndex = this.items.findIndex(dtype => dtype.typeHash === typeHash);
                if (typeIndex > -1) {
                    this.items.splice(typeIndex, 1);
                }
            });
        },
        teardown() {
            if (!this.typeContract) return;
            this.typeContract.removeAllListeners('LogNew')
                .removeAllListeners('LogUpdate')
                .removeAllListeners('LogRemove');
        },
        insert(dtype) {
            if (this.isRoot) {
                this.$store.dispatch('insertType', dtype);
            } else {
                this.typeContract.insert(dtype)
                    .then(tx => tx.wait(2))
                    .then(console.log);
            }
        },
        batchInsert(dtypeArray) {
            if (this.isRoot) {
                this.$store.dispatch('insertBatchType', dtypeArray);
            } else {
                for (let i = 0; i < dtypeArray.length; i++) {
                    this.insert(dtypeArray[i]);
                }
            }
        },
        update(dtype) {
            if (this.isRoot) {
                this.$store.dispatch('updateType', dtype);
            } else {
                this.typeContract.update(dtype.typeHash, dtype)
                    .then(tx => tx.wait(2))
                    .then(console.log);
            }
        },
        remove(dtype) {
            if (this.isRoot) {
                this.$store.dispatch('removeType', dtype);
            } else {
                this.typeContract.remove(dtype.typeHash)
                    .then(tx => tx.wait(2))
                    .then(console.log);
            }
        },
        getHeader(type, required = true) {
            const dimensionsString = typeDimensionsToString(type.dimensions);
            type.fullName = type.name + dimensionsString;
            return {
                text: `${type.label}\n${type.fullName}`,
                value: type.label,
                type,
                required,
            };
        },
        getHeaders(dtype) {
            return dtype.types.map(type => this.getHeader(type))
                .concat(dtype.optionals.map(type => this.getHeader(type, false)));
        },
    },
};
</script>
