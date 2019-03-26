<template>
    <div>
        <v-toolbar flat color='white'>
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
                                        :items='items'
                                        v-on:change="onSelectedType"
                                    />
                                    </v-flex>
                                </v-layout>
                                </v-flex>
                                <v-flex xs12>
                                    <v-text-field v-model='editedItem.labels' label='labels'></v-text-field>
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
            :items='items'
            class='elevation-1'
        >
            <template v-slot:items='props'>

                <template
                    v-for="header in headers"
                >
                    <td class='text-xs-left'>
                        <dTypeBrowseField
                            :type="header.type"
                            :value="props.item[header.value]"
                        />
                    </td>
                </template>
                <td class='justify-center layout px-0'>
                    <v-btn
                        flat icon small
                        color="blue darken-4"
                        :to="`/dtype/${props.item.lang}/${props.item.name}`"
                    >
                        <v-icon>link</v-icon>
                    </v-btn>

                    <v-btn
                        flat icon small
                        color="grey darken-2"
                        @click='editItem(props.item)'
                    >
                        <v-icon>edit</v-icon>
                    </v-btn>
                    <v-btn
                        flat icon small
                        color="grey darken-2"
                        @click='deleteItem(props.item)'
                    >
                        <v-icon>delete</v-icon>
                    </v-btn>
                </td>
            </template>
        </v-data-table>
    </div>
</template>

<script>
import dTypeSearch from '../components/dTypeSearch';
import dTypeBrowseField from '../components/dTypeBrowseField';

export default {
    name: 'dTypeBrowse',
    props: ['headers', 'items', 'defaultItem'],
    components: {
        dTypeSearch,
        dTypeBrowseField,
    },
    data() {
        let data = {
            dialog: false,
            dialogBulk: false,
            editedIndex: -1,
            editedItem: {},
            bulkInsertDefault: '{}',
            bulkInsert: '{}',

        }
        return data;
    },
    computed: {
        formTitle() {
            return this.editedIndex === -1 ? 'New Item' : 'Edit Item';
        },
    },
    watch: {
        dialog (val) {
            val || this.close();
        },
        dialogBulk (val) {
            val || this.closeBulk();
        },
        items() {
            this.setBulkInsert();
        },
        defaultItem() {
            this.setDefaults();
        }
    },
    methods: {
        setDefaults() {
            this.editedItem = Object.assign({}, this.defaultItem);
            this.bulkInsertDefault = JSON.stringify([this.defaultItem]);
            this.bulkInsert = this.items.length > 0 ? JSON.stringify(this.items) : this.bulkInsertDefault;
        },
        setBulkInsert() {
            this.bulkInsert = JSON.stringify(
                this.items.map(dt => {
                    let obj = {};
                    Object.keys(this.defaultItem).forEach(key => {
                        obj[key] = dt[key];
                    });
                    obj.typeHash = dt.typeHash;
                    return obj;
                })
            );
        },
        async insert(dtype) {
            this.$emit('insert', dtype);
        },
        async batchInsert(dtypeArray) {
            this.$emit('batchInsert', dtypeArray);
        },
        async update(dtype) {
            this.$emit('update', dtype);
        },
        async delete(dtype) {
            this.$emit('remove', dtype);
        },
        editItem(item) {
            this.editedIndex = this.items.indexOf(item)
            this.editedItem = Object.assign({}, item)
            this.dialog = true
        },
        deleteItem(item) {
            const index = this.items.indexOf(item)
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
            this.editedItem.labels = this.editedItem.labels.split(',');
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
        },
    },
};
</script>

<style>
.container {
    max-width: 100%;
}
</style>
