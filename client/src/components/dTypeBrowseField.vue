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
            {{ preppedValue }}
        </template>
    </div>
</template>

<script>
import {normalizeEthersObject} from '../blockchain';
import BytesValueField from './BytesValueField';

export default {
    props: ['type', 'value'],
    components: {BytesValueField},
    computed: {
        preppedValue() {
            let preppedValue;
            if (this.value instanceof Array) {
                // TODO display arrays of objects in a nice way
                // return this.value.map(item => normalizeEthersObject(item));
                return this.value.map(item => item.name);
            }
            return this.value;
        }
    },
}
</script>
