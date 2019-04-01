<template>
    <div>
        <template v-for="(label, i) in functionType.labels">
            <v-layout wrap>
                <v-flex xs4>
                    <v-text-field v-model='dataArguments[label]' :label='label'></v-text-field>
                </v-flex>
                <v-flex xs4>
                    <v-select
                        v-model="selectedValues[label]"
                        :items="selectedItems[label]"
                        label="Outline style"
                        outline
                    ></v-select>
                </v-flex>
                <v-flex xs4>
                    <dTypeSearch
                        label='types'
                        :itemKey='selectedValues[label]'
                        itemValue='typeHash'
                        :items='functionData[label]'
                        searchLengthP="1"
                        :returnObjectP="true"
                        @change="setDataItem(label, $event)"
                    />
                </v-flex>
            </v-layout>
        </template>
        <v-layout wrap>
            <v-flex xs4>
                <v-btn
                    flat icon small
                    @click="run"
                >
                    <v-icon>play_circle_filled</v-icon>
                </v-btn>
            </v-flex>
            <v-flex xs6 v-if="txSuccess">
                <router-link
                    v-for="typeName in functionType.outputs"
                    :to="`/dtype/${functionType.lang}/${typeName}`"
                >
                    {{typeName}}
                </router-link>
            </v-flex>
        </v-layout>
    </div>
</template>

<script>
import dTypeSearch from '../components/dTypeSearch';
import {buildDefaultItem, getDataItemsByTypeHash} from '../blockchain';

export default {
    props: ['functionType'],
    components: {dTypeSearch},
    data() {
        let dataArguments = {};
        let selectedItems = {};
        let selectedValues = {};
        let functionData = {};
        this.functionType.labels.forEach((label) => {
            dataArguments[label] = ''; buildDefaultItem(this.functionType);
            selectedItems[label] = [];
            selectedValues[label] = '';
            functionData[label] = [];
        });
        return {
            dataArguments,
            selectedItems,
            selectedValues,
            functionData,
            txSuccess: false,
        };
    },
    created() {
        console.log('functionType', this.functionType);
        this.setData();
    },
    methods: {
        async setData() {
            for (let i = 0; i < this.functionType.labels.length; i++) {
                let label = this.functionType.labels[i];

                let subType = await this.$store.dispatch(
                    'getTypeStructByName',
                    {
                        lang: this.functionType.lang,
                        name: this.functionType.types[i],
                    }
                );

                this.selectedItems[label] = subType.labels;
                this.selectedValues[label] = subType.labels[0];

                getDataItemsByTypeHash(
                    this.$store.state.contract,
                    this.$store.state.wallet,
                    subType,
                    (dataItem) => {
                        this.functionData[label].push(dataItem);
                    },
                );
            };
        },
        async run() {
            const dataHashes = this.functionType.labels.map((label) => this.dataArguments[label]);
            console.log('run', this.$store.state.contract.address, this.functionType.typeHash, dataHashes);

            // TODO fix gas estimation for Ganache
            const tx = await this.$store.state.contract.run(this.functionType.typeHash, dataHashes, {gasLimit: 4000000});

            tx.wait(2).then((receipt) => {
                console.log('run receipt', receipt);
                if (receipt.status == 1) {
                    this.txSuccess = true;
                }
            });

            this.$store.state.provider.waitForTransaction(tx.hash).then((receipt) => {
                console.log('Transaction Mined: ' + receipt.transactionHash, receipt);
                if (receipt.status == 1) {
                    this.txSuccess = true;
                }
            });
        },
        setDataItem(label, event) {
            if (!event || !event[0]) return;
            this.dataArguments[label] = event[0].typeHash;
        },
    },
}
</script>
