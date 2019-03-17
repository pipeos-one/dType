<template>
    <div>
        {{dtype}}
        <template v-if="dtype">
            <router-link
                v-for="(hash, i) in dtype.typesHashes"
                :to="`/dtype/${hash}`"
            >
                {{dtype.types[i]}}
            </router-link>
        </template>
    </div>
</template>

<script>
export default {
    name: 'dTypeView',
    props: ['dtype'],
    data() {
        return {

        };
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
