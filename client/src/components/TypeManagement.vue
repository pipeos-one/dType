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

                    <v-card-text v-if="editedItem">
                        <v-container grid-list-md>
                            <v-layout wrap>
                                <v-flex xs12>
                                    <v-text-field v-model='editedItem.name' label='name'></v-text-field>
                                </v-flex>
                                <v-flex xs12>
                                    <v-layout row wrap>
                                    <v-flex xs6>
                                    <!-- <v-text-field v-model='editedItem.types' label='types'></v-text-field> -->
                                    <v-chip close
                                        v-for="(type, i) in editedItem.types"
                                        v-on:input="onRemovedType(type, i)"
                                    >
                                        {{type}}
                                    </v-chip>
                                    </v-flex>
                                    <v-flex xs6>
                                    <dTypeSearch
                                        label='types'
                                        itemKey='name'
                                        itemValue='name'
                                        :items='dtypes'
                                        v-on:change="onSelectedType"
                                    />
                                    </v-flex>
                                </v-layout>
                                </v-flex>
                                <v-flex xs12>
                                    <v-text-field v-model='editedItem.lang' label='language'></v-text-field>
                                </v-flex>
                                <v-flex xs12>
                                    <v-text-field v-model='editedItem.isEvent' label='isEvent'></v-text-field>
                                </v-flex>
                                <v-flex xs12>
                                    <v-text-field v-model='editedItem.isFunction' label='isFunction'></v-text-field>
                                </v-flex>
                                <v-flex xs12>
                                    <v-text-field v-model='editedItem.hasOutput' label='hasOutput'></v-text-field>
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
            <v-dialog v-model='dialogBulk' max-width='600px'>
                <template v-slot:activator='{ on }'>
                    <v-btn
                        small flat fab
                        v-on='on'
                    >
                        <v-icon>fa-folder-plus</v-icon>
                    </v-btn>
                </template>
                <v-card>
                    <v-card-title>
                        <span class='headline'>Bulk Insert</span>
                    </v-card-title>

                    <v-card-text>
                        <v-container grid-list-md>
                            <v-layout wrap>
                                <v-flex xs12>
                                    <v-textarea
                                        outline
                                        name="bulkInsert"
                                        v-model='bulkInsert'
                                        label="array of types"
                                        :placeholder="bulkInsertDefault"
                                    ></v-textarea>
                                </v-flex>
                            </v-layout>
                        </v-container>
                    </v-card-text>

                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color='blue darken-1' flat @click='closeBulk'>Cancel</v-btn>
                        <v-btn color='blue darken-1' flat @click='saveBulk'>Save</v-btn>
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
                <td class='text-xs-left'>{{ props.item.lang }}</td>
                <td class='text-xs-left'>{{ props.item.isEvent }}</td>
                <td class='text-xs-left'>{{ props.item.isFunction }}</td>
                <td class='text-xs-left'>{{ props.item.hasOutput }}</td>
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
import dTypeSearch from './dTypeSearch';
// object = {typeFullName: hash}
// types name
export default {
    props: ['contract', 'from'],
    components: {
        dTypeSearch,
    },
    data: () => ({
        dialog: false,
        dialogBulk: false,
        headers: [
            {text: 'name', align: 'left', value: 'name'},  // sortable: false
            { text: 'types', value: 'types' },
            { text: 'language', value: 'lang' },
            { text: 'isEvent', value: 'isEvent' },
            { text: 'isFunction', value: 'isFunction' },
            { text: 'hasOutput', value: 'hasOutput' },
            { text: 'contract address', value: 'contractAddress' },
            { text: 'source', value: 'source' },
        ],
        dtypes: [],
        editedIndex: -1,
        editedItem: {
            name: '',
            types: [],
            lang: 0,
            isEvent: false,
            isFunction: false,
            hasOutput: false,
            contractAddress: '0x0000000000000000000000000000000000000000',
            source: '0x0000000000000000000000000000000000000000000000000000000000000000',
        },
        defaultItem: {
            name: '',
            types: [],
            lang: 0,
            isEvent: false,
            isFunction: false,
            hasOutput: false,
            contractAddress: '0x0000000000000000000000000000000000000000',
            source: '0x0000000000000000000000000000000000000000000000000000000000000000',
        },
        bulkInsert: JSON.stringify([{
                name: "uint256",
                types: [],
                lang: 0,
                isEvent: false,
                isFunction: false,
                hasOutput: false,
                contractAddress: "0xCd9492Cdae7E8F8B5a648c6E15c4005C4cd9028b",
                source: "0x0000000000000000000000000000000000000000000000000000000000000000"
        }]),
        bulkInsertDefault: JSON.stringify([{
                name: "uint256",
                types: [],
                lang: 0,
                isEvent: false,
                isFunction: false,
                hasOutput: false,
                contractAddress: "0xCd9492Cdae7E8F8B5a648c6E15c4005C4cd9028b",
                source: "0x0000000000000000000000000000000000000000000000000000000000000000"
        }]),
    }),
    computed: {
        formTitle() {
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
        dialogBulk (val) {
            val || this.closeBulk();
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
            let indexes = await this.contract.getIndex();
            for (let i = 0; i < indexes.length; i++) {
                let hash = indexes[i];
                this.dtypes.push(await this.getTypeStruct(hash));
            }
            this.bulkInsert = JSON.stringify(
                this.dtypes.map(dt => {
                    let obj = {};
                    Object.keys(this.defaultItem).forEach(key => {
                        obj[key] = dt[key];
                    });
                    obj.typeHash = dt.typeHash;
                    return obj;
                })
            );
        },
        async getTypeStruct(hash) {
            let struct = await this.contract.getByHash(hash);
            struct.types = await this.contract.getTypes(hash);
            struct.typeHash = hash;
            // console.log('getTypeStruct', struct);
            return struct;
        },
        async insert(dtype) {
            let {name, types, lang, isEvent, isFunction, hasOutput, contractAddress, source} = dtype;
            console.log('insert dtype', name, types, lang, isEvent, isFunction, hasOutput, contractAddress, source);
            let tx = await this.contract.insert(lang, name, types, isEvent, isFunction, hasOutput, contractAddress, source);
            let receipt = await tx.wait(2);
            console.log('receipt', receipt);
        },
        async batchInsert(dtypeArray) {
            console.log('batchInsert', dtypeArray);
            for (let i = 0; i < dtypeArray.length; i++) {
                await this.insert(dtypeArray[i]);
            };
        },
        async update(dtype) {
            console.log('update dtype', JSON.stringify(dtype));
            let {name, types, typeHash} = dtype;
            let tx = await this.contract.update(typeHash, name, types);
            let receipt = await tx.wait(2);
            console.log('receipt', receipt);
        },
        async delete(dtype) {
            console.log('delete dtype', JSON.stringify(dtype));
            let tx = await this.contract.remove(dtype.typeHash);
            let receipt = await tx.wait(2);
            console.log('receipt', receipt);
        },
        watchInsert() {
            this.contract.on('LogNew', (typeHash, index, name, types) => {
                console.log('LogNew', typeHash, index, name, types);
                this.getTypeStruct(typeHash).then((struct) => {
                    this.dtypes.push(struct);
                });
            });
        },
        watchUpdate() {
            this.contract.on('LogUpdate', (typeHash, index, name, types) => {
                console.log('LogUpdate', typeHash, index, name, types);
                let typeIndex = this.dtypes.findIndex((dtype) => dtype.typeHash === typeHash);
                this.getTypeStruct(typeHash).then((struct) => {
                    // We have a LogUpdate in remove(), this can log an empty struct
                    if (struct) {
                        Object.assign(this.dtypes[typeIndex], struct);
                    }
                });
            });
        },
        watchRemove() {
            this.contract.on('LogRemove', (typeHash, index) => {
                console.log('LogRemove', typeHash, index);
                let typeIndex = this.dtypes.findIndex((dtype) => dtype.typeHash === typeHash);
                if (typeIndex > -1) {
                    this.dtypes.splice(typeIndex, 1);
                }
            });
        },
        removeWatchers() {
            this.contract.removeAllListeners('LogNew')
                .removeAllListeners('LogUpdate')
                .removeAllListeners('LogRemove');
        },
        editItem(item) {
            this.editedIndex = this.dtypes.indexOf(item)
            this.editedItem = Object.assign({}, item)
            this.dialog = true
        },
        deleteItem(item) {
            const index = this.dtypes.indexOf(item)
            confirm('Are you sure you want to delete this item?') && this.delete(item);
        },
        close() {
            this.dialog = false;
            setTimeout(() => {
                this.editedItem = Object.assign({}, this.defaultItem);
                this.editedIndex = -1;
            }, 300)
        },
        save() {
            if (this.editedIndex > -1) {
                this.update(this.editedItem);
            } else {
                this.insert(this.editedItem);
            }
            this.close();
        },
        closeBulk() {
            this.dialogBulk = false;
        },
        saveBulk() {
            let bulk;
            try {
                bulk = JSON.parse(this.bulkInsert);
                this.batchInsert(bulk);
                this.closeBulk();
            } catch (e) {
                alert(`${e}`);
            }
        },
        onSelectedType(values) {
            values = this.editedItem.types.concat(values);
            this.editedItem.types = values;
        },
        onRemovedType(value, i) {
            this.editedItem.types.splice(i, 1);
        }
    },
};
</script>

<style>
.container {
    max-width: 100%;
}
</style>
