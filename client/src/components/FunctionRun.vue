<template>
    <div>
        Run Function
        <!-- <dTypeSearch
            label='types'
            itemKey='name'
            itemValue='name'
            :items='functionData'
            v-on:change="onSelectedType"
        /> -->
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

export default {
    props: ['functionType', 'functionData'],
    components: {dTypeSearch},
    created() {
        console.log('functionType', this.functionType);
    },
    methods: {
        async run() {
            const signature = await this.$store.state.contract.getSignature(this.functionType.typeHash);
            console.log('signature', signature);

            // const tx = await this.$store.state.contract.run(signature, dataHashes);
            // console.log('tx', tx);
            // const receipt = tx.wait(2);
            // console.log('receipt', receipt);
        },
    },
}
</script>
