<template>
    <div>
        <template v-if="type.name == 'address'">
            <BytesValueField
                :value="value"
                baseUrl="https://ropsten.etherscan.io/address/"
            />
        </template>
        <template v-else-if="type.name == 'bytes32'">
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
    props: ['type', 'value'],
    components: {BytesValueField},
}
</script>
