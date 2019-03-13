<template>
    <v-app>
        <v-content>
            <TypeManagement
                :contract="contract"
                :from="from"
            />
        </v-content>
    </v-app>
</template>

<script>
import TypeManagement from './components/TypeManagement';
import {ethers} from 'ethers';
import DType from './constants';
import {waitAsync} from './utils';

export default {
    name: 'App',
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
            let wallet = new ethers.Wallet(DType.from.privateKey, provider);

            console.log(provider);
            console.log(wallet);
            console.log('DType', DType);

            await waitAsync(1000);
            const contractAddress = DType.contract.networks[String(provider.network.chainId)].address;

            console.log('contractAddress', contractAddress)
            this.contract = new ethers.Contract(
                contractAddress,
                DType.contract.abi,
                wallet,
            );
        },
        // async setStage2() {
        //     // const web3 = new Web3('ws://127.0.0.1:7545');
        //     const web3 = new Web3(Web3.givenProvider);
        //
        //     let networkId = String(await web3.eth.net.getId());
        //
        //     const account = web3.eth.accounts.privateKeyToAccount('0x' + DType.from.privateKey);
        //     web3.eth.accounts.wallet.add(account);
        //     web3.eth.defaultAccount = account.address;
        //
        //     this.web3 = web3;
        //     this.contract = new web3.eth.Contract(
        //         DType.contract.abi,
        //         DType.contract.networks[networkId].address,
        //     );
        //     console.log('web3', web3);
        //     console.log(networkId, DType.contract.networks[networkId].address);
        //     console.log('contract', this.contract);
        //     console.log('account', account);
        // },
    },
};
</script>
