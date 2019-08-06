<template>
  <v-flex xs12>
    <p>
      {{parseContent(aliasData)}}
    </p>
  </v-flex>
</template>

<script>
import {VFlex} from 'vuetify/lib';

export default {
  name: 'DefaultView',
  props: ['data'],
  components: {VFlex},
  mounted() {
    this.parseContent();
  },
  watch: {
    data() {
      this.parseContent();
    },
  },
  methods: {
    parseContent() {
      return `${this.data}`;
    },
  },
};
</script>
