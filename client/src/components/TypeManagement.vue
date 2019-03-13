<template>
    <v-container>
        <v-layout
            text-xs-center
            wrap
        >
            <v-flex xs12>
                <v-btn
                    small flat fab
                    v-on:click="insert"
                >
                    <v-icon>fa-plus</v-icon>
                </v-btn>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>

export default {
    props: ['contract', 'from'],
    data: () => ({
        types: [],
    }),
    created() {

    },
    watch: {
        contract() {
            if (this.contract) {
                this.setData();
            }
        },
    },
    methods: {
        async setData() {
            let types = [];
            let indexes = await this.contract.getIndex();
            for (let i = 0; i < indexes.length; i++) {
                let hash = indexes[i];
                let struct = await this.contract.typeStruct(hash);

                types.push(struct);
            }
            console.log('types', types);
            this.types = types;
        },
        async insert() {
            let tx = await this.contract.insert(
                "uint256",
                ["0x0000000000000000000000000000000000000000000000000000000000000000"],
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000000000000000000000000000",
            );
            console.log('tx', tx);
            let receipt = await tx.wait(2);
            console.log('receipt', receipt);
        },
    },
};
</script>

<style>

</style>
