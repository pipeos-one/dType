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
  props: ['content'],
  components: {VFlex},
  computed: {
    parsedContent() {
      return JSON.stringify(this.content);
    },
  },
};
</script>
