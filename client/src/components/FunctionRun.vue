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
        <v-btn
            flat icon small
            @click="run"
        >
            <v-icon>play_circle_filled</v-icon>
        </v-btn>
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
                console.log('subType', subType);
                this.selectedItems[label] = subType.labels;
                this.selectedValues[label] = subType.labels[0];

                getDataItemsByTypeHash(
                    this.$store.state.contract,
                    this.$store.state.wallet,
                    subType,
                    (dataItem) => {
                        console.log('dataItem', dataItem, this.selectedValues[label]);
                        this.functionData[label].push(dataItem);
                    },
                );
            };
        },
        async run() {
            const dataHashes = this.functionType.labels.map((label) => this.dataArguments[label]);

            const tx = await this.$store.state.contract.run(this.functionType.typeHash, dataHashes);
            console.log('tx', tx);
            const receipt = tx.wait(2);
            console.log('receipt', receipt);
        },
        setDataItem(label, event) {
            if (!event || !event[0]) return;
            this.dataArguments[label] = event[0].typeHash;
        },
    },
}
</script>
