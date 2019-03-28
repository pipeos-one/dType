<template>
    <div>
        <v-toolbar flat color='white' v-if="dtype">
            <v-toolbar-title>{{dtype.name}}</v-toolbar-title>
            <v-spacer></v-spacer>
            Functions that use this type
        </v-toolbar>

        <template v-if="dtype">
            <v-layout wrap>
                <v-flex xs4>
                    <router-link
                        v-for="typeName in dtype.types"
                        :to="`/dtype/${dtype.lang}/${typeName}`"
                    >
                        {{typeName}}
                    </router-link>
                </v-flex>
                <v-flex xs4>
                    <router-link
                        v-for="typeName in dtype.outputs"
                        :to="`/dtype/${dtype.lang}/${typeName}`"
                    >
                        {{typeName}}
                    </router-link>
                </v-flex>
            </v-layout>
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
                            <v-dialog v-model='runFunctionDialog' max-width='600px'>
                                <template v-slot:activator='{ on }'>
                                    <v-btn
                                        flat icon small
                                        color="grey darken-2"
                                        v-on='on'
                                    >
                                        <v-icon>play_circle_filled</v-icon>
                                    </v-btn>
                                </template>
                                <v-card>
                                    <v-card-title>
                                        <p class='headline'>Run <span class='font-italic'>{{props.item.name}}</span> function</p>
                                    </v-card-title>
                                    <v-card-text>
                                        <FunctionRun
                                            v-if="runFunctionDialog"
                                            :functionType="props.item"
                                        />
                                    </v-card-text>
                                </v-card>
                            </v-dialog>
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
import FunctionRun from './FunctionRun';

export default {
    name: 'dTypeView',
    props: ['dtype', 'parentHeaders', 'dtypes'],
    components: {dTypeBrowseField, FunctionRun},
    data() {
        return {runFunctionDialog: false};
    },
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
            if (!this.dtype) return [];
            return this.dtypes.filter((dtype) => {
                return dtype.types.indexOf(this.dtype.name) > -1 && dtype.isFunction;
            });
        },
    },
}
</script>
