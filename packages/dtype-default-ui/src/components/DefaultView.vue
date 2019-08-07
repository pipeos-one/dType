<template>
  <v-flex xs12>
    <p>
      {{parsedContent}}
    </p>
  </v-flex>
</template>

<script>
import {VFlex} from 'vuetify/lib';

export default {
  name: 'DefaultView',
  props: ['value'],
  components: {VFlex},
  computed: {
    parsedContent() {
      return JSON.stringify(this.value);
    },
  },
};
</script>
