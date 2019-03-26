<template>
    <div>
        <dTypeView :dtype="typeStruct"
            :parentHeaders="dtypeHeaders"
            :dtypes="dtypes"
            :storageItems="items"
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
import { mapState } from 'vuex';
import dTypeBrowse from '../components/dTypeBrowse';
import dTypeView from '../components/dTypeView';
import {EMPTY_ADDRESS} from '../constants_utils';
import {buildTypeAbi} from '../dtype_utils';
import {getContract, buildStructAbi, buildDefaultItem} from '../blockchain';

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
                let hash = this.hash;
                if (this.name) {
                    hash = await this.contract.getTypeHash(this.lang, this.name);
                }
                this.typeStruct = await this.$store.dispatch('getTypeStruct', hash);
                this.typeContract = null;
                this.items = [];
                this.headers = this.getHeaders(this.typeStruct);
                this.isRoot = false;

                if (this.typeStruct.contractAddress && this.typeStruct.contractAddress !== EMPTY_ADDRESS) {
                    const dtypeAbi = await buildStructAbi(this.contract, this.typeStruct.typeHash);

                    const abi = buildTypeAbi(dtypeAbi);
                    this.typeContract = await getContract(
                        this.typeStruct.contractAddress,
                        abi,
                        this.$store.state.wallet,
                    );
                }
            }
            // TODO set contract & storage items
            // TODO event watchers
            this.defaultItem = buildDefaultItem(this.typeStruct);
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
            }
        },
        batchInsert(dtypeArray) {
            if (this.isRoot) {
                this.$store.dispatch('insertBatchType', dtypeArray);
            }
        },
        update(dtype) {
            if (this.isRoot) {
                this.$store.dispatch('updateType', dtype);
            }
        },
        remove(dtype) {
            if (this.isRoot) {
                this.$store.dispatch('removeType', dtype);
            }
        },
        getHeaders(dtype) {
            return dtype.labels.map((label, i) => {
                return {
                    text: `${label}\n${dtype.types[i]}`,
                    value: label,
                    type: dtype.types[i],
                };
            });
        },
    },
}
</script>
