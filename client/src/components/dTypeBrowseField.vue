<template>
    <div>
        <template v-if="field.match(/address/gi)">
            <BytesValueField
                :value="value"
                baseUrl="https://ropsten.etherscan.io/address/"
            />
        </template>
        <template v-else-if="field.match(/source/gi)">
            <BytesValueField
                :value="value.substring(2)"
                baseUrl="https://swarm-gateways.net/bzz-raw:/"
            />
        </template>
        <template v-else>
            {{ value }}
        </template>
    </div>
</template>

<script>
import BytesValueField from './BytesValueField';

export default {
    props: ['field', 'value'],
    components: {BytesValueField},
}
</script>
