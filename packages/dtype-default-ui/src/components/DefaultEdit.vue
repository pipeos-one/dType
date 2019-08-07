<template>
  <v-flex xs12>
    Edit: <p>
      {{parsedContent}}
    </p>
  </v-flex>
</template>

<script>
import {VFlex} from 'vuetify/lib';

export default {
  name: 'DefaultEdit',
  props: ['value'],
  components: {VFlex},
  computed: {
    parsedContent() {
      return JSON.stringify(this.value);
    },
  },
};
</script>
