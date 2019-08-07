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
  props: ['content'],
  components: {VFlex},
  computed: {
    parsedContent() {
      return JSON.stringify(this.content);
    },
  },
};
</script>
