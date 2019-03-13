<template>
    <div>
        <v-toolbar flat color='white'>
            <v-toolbar-title>dTypes</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-dialog v-model='dialog' max-width='600px'>
                <template v-slot:activator='{ on }'>
                    <v-btn
                        small flat fab
                        v-on='on'
                    >
                        <v-icon>fa-plus</v-icon>
                    </v-btn>
                </template>
                <v-card>
                    <v-card-title>
                        <span class='headline'>{{ formTitle }}</span>
                    </v-card-title>

                    <v-card-text>
                        <v-container grid-list-md>
                            <v-layout wrap>
                                <v-flex xs12>
                                    <v-text-field v-model='editedItem.name' label='name'></v-text-field>
                                </v-flex>
                                <v-flex xs12>
                                    <v-text-field v-model='editedItem.types' label='types'></v-text-field>
                                </v-flex>
                                <v-flex xs12>
                                    <v-text-field v-model='editedItem.contractAddress' label='address'></v-text-field>
                                </v-flex>
                                <v-flex xs12>
                                    <v-text-field v-model='editedItem.source' label='source'></v-text-field>
                                </v-flex>
                            </v-layout>
                        </v-container>
                    </v-card-text>

                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color='blue darken-1' flat @click='close'>Cancel</v-btn>
                        <v-btn color='blue darken-1' flat @click='save'>Save</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-toolbar>
        <v-data-table
            :headers='headers'
            :items='dtypes'
            class='elevation-1'
        >
            <template v-slot:items='props'>
                <td>{{ props.item.name }}</td>
                <td class='text-xs-left'>{{ props.item.types }}</td>
                <td class='text-xs-left'>{{ props.item.contractAddress }}</td>
                <td class='text-xs-left'>{{ props.item.source }}</td>
                <td class='justify-center layout px-0'>
                    <v-icon
                        small
                        class='mr-2'
                        @click='editItem(props.item)'
                    >
                        edit
                    </v-icon>
                    <v-icon
                        small
                        @click='deleteItem(props.item)'
                    >
                        delete
                    </v-icon>
                </td>
            </template>
        </v-data-table>
    </div>
</template>

<script>
// object = {typeFullName: hash}
// types name
export default {
    props: ['contract', 'from'],
    data: () => ({
        dialog: false,
        headers: [
            {text: 'name', align: 'left', value: 'name'},  // sortable: false
            { text: 'types', value: 'types' },
            { text: 'contract address', value: 'contractAddress' },
            { text: 'source', value: 'source' },
        ],
        dtypes: [],
        editedIndex: -1,
        editedItem: {
            name: '',
            types: ['0x0000000000000000000000000000000000000000000000000000000000000000'],
            contractAddress: '0x0000000000000000000000000000000000000000',
            source: '0x0000000000000000000000000000000000000000000000000000000000000000',
        },
        defaultItem: {
            name: '',
            types: ['0x0000000000000000000000000000000000000000000000000000000000000000'],
            contractAddress: '0x0000000000000000000000000000000000000000',
            source: '0x0000000000000000000000000000000000000000000000000000000000000000',
        },
    }),
    computed: {
        formTitle () {
            return this.editedIndex === -1 ? 'New Item' : 'Edit Item';
        },
    },
    created() {
        if (this.contract) {
            this.initialize();
        }
    },
    destroyed() {
        if (this.contract) {
            this.removeWatchers();
        }
    },
    watch: {
        dialog (val) {
            val || this.close();
        },
        contract() {
            if (this.contract) {
                this.initialize();
            }
        },
    },
    methods: {
        initialize() {
            this.setData();
            this.watchInsert();
            this.watchUpdate();
            this.watchRemove();
        },
        async setData() {
            let dtypes = [];
            let indexes = await this.contract.getIndex();
            for (let i = 0; i < indexes.length; i++) {
                let hash = indexes[i];
                dtypes.push(await this.getTypeStruct(hash));
            }
            console.log('dtypes', dtypes);
            this.dtypes = dtypes;
        },
        async getTypeStruct(hash) {
            let struct = await this.contract.typeStruct(hash);
            struct.types = await this.contract.getTypes(hash);
            return struct;
        },
        async insert(dtype) {
            console.log('dtype', JSON.stringify(dtype));
            let {name, types, contractAddress, source} = dtype;
            let tx = await this.contract.insert(name, types, contractAddress, source);
            let receipt = await tx.wait(2);
            console.log('receipt', receipt);
            console.log(receipt.events[0].args);
        },
        watchInsert() {
            this.contract.on('LogNew', (typeHash, index, name, types) => {
                console.log('LogNew', typeHash, index, name, types);
                this.getTypeStruct(typeHash).then((struct) => {
                    this.dtypes.push(struct);
                })
            });
        },
        watchUpdate() {
            this.contract.on('LogUpdate', (typeHash, index, name, types) => {
                console.log('LogUpdate', typeHash, index, name, types);
            });
        },
        watchRemove() {
            this.contract.on('LogRemove', (typeHash, index) => {
                console.log('LogRemove', typeHash, index);
            });
        },
        removeWatchers() {
            this.contract.removeAllListeners('LogNew')
                .removeAllListeners('LogUpdate')
                .removeAllListeners('LogRemove');
        },
        editItem (item) {
            this.editedIndex = this.dtypes.indexOf(item)
            this.editedItem = Object.assign({}, item)
            this.dialog = true
        },
        deleteItem (item) {
            const index = this.dtypes.indexOf(item)
            confirm('Are you sure you want to delete this item?') && this.dtypes.splice(index, 1)
        },
        close () {
            this.dialog = false
            setTimeout(() => {
                this.editedItem = Object.assign({}, this.defaultItem)
                this.editedIndex = -1
            }, 300)
        },
        save () {
            if (this.editedIndex > -1) {
                Object.assign(this.dtypes[this.editedIndex], this.editedItem)
            } else {
                this.insert(this.editedItem);
            }
            this.close()
        },
    },
};
</script>

<style>
.container {
    max-width: 100%;
}
</style>
