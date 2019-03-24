<template>
        <v-container>
            <dTypeView :dtype="dtype" />
        </v-container>
</template>

<script>
import {ethers} from 'ethers';
import dTypeView from '../components/dTypeView';
import DType from '../constants';
import {waitAsync} from '../utils';

export default {
    name: 'dTypeInfo',
    components: {
        dTypeView,
    },
    props: ['hash', 'lang', 'name'],
    data() {
        return {
            dtype: null,
            contract: null,
        };
    },
    async created() {
        await this.setStage();
        this.setData();
    },
    watch: {
        hash() {
            this.setData();
        },
        lang() {
            this.setData();
        },
        name() {
            this.setData();
        },
    },
    methods: {
        setData() {
            if (this.hash) {
                this.getDtypeByHash();
            } else {
                this.getDtypeByName();
            }
        },
        async setStage() {
            const provider = new ethers.providers.Web3Provider(web3.currentProvider);
            const wallet = new ethers.Wallet(DType.from.privateKey, provider);

            await waitAsync(1000);
            const contractAddress = DType.contract.networks[
                String(provider.network.chainId)
            ].address;

            this.contract = new ethers.Contract(
                contractAddress,
                DType.contract.abi,
                wallet,
            );
        },
        async getDtypeByHash() {
            let dtype = await this.contract.getByHash(this.hash);
            this.prepDtype(dtype);
        },
        async getDtypeByName() {
            let dtype = await this.contract.get(this.lang, this.name);
            this.prepDtype(dtype);
        },
        async prepDtype(dtype) {
            let dtypePrep = {};
            Object.keys(dtype.data || {})
                .filter(key => !parseInt(key))
                .forEach(key => dtypePrep[key] = dtype.data[key]);
            dtypePrep.typeHash = this.hash;
            dtypePrep.index = dtype.index.toNumber();

            dtypePrep.typesHashes = [];
            for (let i = 0; i < dtypePrep.types.length; i++) {
                let type = await this.contract.getTypeHash(dtypePrep.lang, dtypePrep.types[i]);
                dtypePrep.typesHashes.push(type);
            }
            this.dtype = dtypePrep;
        }
    },
};
</script>
