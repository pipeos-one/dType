<template>
    <div>
        <v-toolbar flat color='white' v-if="dtype">
            <v-toolbar-title>{{dtype.name}}</v-toolbar-title>
            <v-spacer></v-spacer>
            Functions that use this type
        </v-toolbar>

        <template v-if="dtype">
            <router-link
                v-for="typeName in dtype.types"
                :to="`/dtype/${dtype.lang}/${typeName}`"
            >
                {{typeName}}
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
            <v-flex xs8>
                <v-data-table
                    :headers="parentHeaders"
                    :items="relatedFunctions"
                    class="elevation-1"
                >
                    <template v-slot:items="props">
                        <template
                            v-for="header in parentHeaders"
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
                                @click='runSource(props.item)'
                            >
                                <v-icon>play_circle_filled</v-icon>
                            </v-btn>
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
    props: ['dtype', 'parentHeaders', 'dtypes'],
    components: {dTypeBrowseField},
    computed: {
        headers() {
            return [{value: 'key', text: 'key'}, {value: 'value', text: 'value'}];
        },
        items() {
            if (!this.dtype) return [];
            return this.parentHeaders.map((header) => {
                return {
                    key: header.value,
                    value: this.dtype[header.value],
                    type: header.type,
                };
            });
        },
        relatedFunctions() {
            return this.dtypes.filter((dtype) => {
                return dtype.types.indexOf(this.dtype.name) > -1 && dtype.isFunction;
            });
        },
    },
    methods: {
        runSource() {
            console.log('runSource');
        },
    },
}
</script>
