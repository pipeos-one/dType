<template>
    <div>
        <template v-for="(type, i) in functionType.types">
            <v-layout wrap>
                <v-flex xs4>
                    <v-text-field v-model='dataArguments[type.label]' :label='type.label'></v-text-field>
                </v-flex>
                <v-flex xs4>
                    <v-select
                        v-model="selectedValues[type.label]"
                        :items="selectedItems[type.label]"
                        label="Outline style"
                        outline
                    ></v-select>
                </v-flex>
                <v-flex xs4>
                    <dTypeSearch
                        label='types'
                        :itemKey='selectedValues[type.label]'
                        itemValue='typeHash'
                        :items='functionData[type.label]'
                        searchLengthP="1"
                        :returnObjectP="true"
                        @change="setDataItem(type.label, $event)"
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
                    v-for="typeObj in functionType.outputs"
                    :to="`/dtype/${functionType.lang}/${typeObj.name}`"
                >
                    {{typeObj.name}}
                </router-link>
            </v-flex>
        </v-layout>
    </div>
</template>

<script>
import dTypeSearch from '../components/dTypeSearch';
import {buildDefaultItem, getDataItemsByTypeHash} from 'dtype-core/dtype-utils';

export default {
    props: ['functionType'],
    components: {dTypeSearch},
    data() {
        let dataArguments = {};
        let selectedItems = {};
        let selectedValues = {};
        let functionData = {};

        this.functionType.types.forEach((type) => {
            dataArguments[type.label] = ''; buildDefaultItem(this.functionType);
            selectedItems[type.label] = [];
            selectedValues[type.label] = '';
            functionData[type.label] = [];
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
        this.setData();
    },
    methods: {
        async setData() {
            for (let i = 0; i < this.functionType.types.length; i++) {
                let label = this.functionType.types[i].label;

                let subType = await this.$store.dispatch(
                    'getTypeStruct',
                    {
                        lang: this.functionType.lang,
                        name: this.functionType.types[i].name,
                    }
                );

                this.selectedItems[label] = subType.types.map(type => type.label);
                this.selectedValues[label] = this.selectedItems[label][0];

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
            const dataHashes = this.functionType.types.map((type) => this.dataArguments[type.label]);
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
