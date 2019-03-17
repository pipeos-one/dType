<template>
    <v-container>
        <TypeManagement
            :contract="contract"
            :from="from"
        />
    </v-container>
</template>

<script>
import {ethers} from 'ethers';
import TypeManagement from '../components/TypeManagement';
import DType from '../constants';
import {waitAsync} from '../utils';

export default {
    name: 'dTypeBrowse',
    components: {
        TypeManagement,
    },
    data() {
        return {
            contract: null,
            from: DType.from,
        };
    },
    created() {
        this.setStage();
    },
    methods: {
        async setStage() {
            // const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:9545');
            const provider = new ethers.providers.Web3Provider(web3.currentProvider);
            const wallet = new ethers.Wallet(DType.from.privateKey, provider);

            console.log(provider);
            console.log(wallet);
            console.log('DType', DType);

            await waitAsync(1000);
            const contractAddress = DType.contract.networks[
                String(provider.network.chainId)
            ].address;

            console.log('contractAddress', contractAddress);
            this.contract = new ethers.Contract(
                contractAddress,
                DType.contract.abi,
                wallet,
            );
        },
    },
};
</script>
