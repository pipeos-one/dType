<template>
    <div>
        <dTypeView :dtype="typeStruct" />
        <dTypeBrowse
            :headers="headers"
            :items="items"
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
        isRoot: false,
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
    },
    methods: {
        async setData() {
            await this.setContract();
        },
        async setContract() {
            if (this.hash === this.dtype.typeHash || this.name === this.dtype.name) {
                console.log('isRoot');
                this.isRoot = true;
                this.typeContract = this.contract;
                this.typeStruct = this.dtype;
                this.items = this.dtypes;
                this.headers = this.dtype.labels.map((label, i) => {
                    return {
                        text: `${label}\n${this.dtype.types[i]}`,
                        value: label,
                        type: this.dtype.types[i],
                    };
                });
                return;
            }
            let dtype;
            if (this.hash) {
                dtype = await this.contract.getByHash(this.hash);
            } else {
                dtype = await this.contract.get(this.lang, this.name);
            }
            this.typeStruct = dtype;
            this.typeContract = null;
            this.items = [];
            this.headers = [];
            this.isRoot = false;
            // TODO set contract & storage items
            // TODO event watchers
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
    },
}
</script>
