<template>
  <v-flex xs12>
    <p>
      Edit:
      {{parseContent(aliasData)}}
    </p>
  </v-flex>
</template>

<script>
export default {
  name: 'DefaultEdit',
  props: ['data'],
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
