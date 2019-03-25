<template>
    <div>
        <v-toolbar flat color='white' v-if="dtype">
            <v-toolbar-title>{{dtype.name}}</v-toolbar-title>
        </v-toolbar>

        <template v-if="dtype">
            <router-link
                v-for="(hash, i) in dtype.typesHashes"
                :to="`/dtype/${hash}`"
            >
                {{dtype.types[i]}}
            </router-link>
        </template>

        <v-layout wrap>
            <v-flex xs4>
                <v-data-table
                    :headers="headers"
                    :items="items"
                    class="elevation-1"
                >
                    <template v-slot:items="props">
                        <td class="text-xs-left">
                            {{ props.item[headers[0].value] }}
                        </td>
                        <td class="text-xs-left">
                            <dTypeBrowseField
                                :type="props.item.type"
                                :value="props.item[headers[1].value]"
                            />
                        </td>
                    </template>
                </v-data-table>
            </v-flex>
        </v-layout>
        </br>
    </div>
</template>

<script>
import dTypeBrowseField from './dTypeBrowseField';
export default {
    name: 'dTypeView',
    props: ['dtype', 'parentHeaders'],
    components: {dTypeBrowseField},
    data() {
        return {

        };
    },
    computed: {
        headers() {
            return [{value: 'key', text: 'key'}, {value: 'value', text: 'value'}];
        },
        items() {
            if (!this.dtype) return [];

            const items = this.parentHeaders.map((header) => {
                return {
                    key: header.value,
                    value: this.dtype[header.value],
                    type: header.type,
                };
            });
            console.log('items', items);
            return items;
        },
    },
    watch: {
        dtype() {
            console.log('dtype', this.dtype);
        },
    },
    created() {
        console.log('dtype', this.dtype);
    },
}
</script>
