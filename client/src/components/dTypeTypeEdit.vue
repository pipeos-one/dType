<template>
  <v-flex xs4>
  <v-card>
    <v-flex xs2 offset-xs8>
      <v-btn fab small>
        <v-icon @click="onRemove()">close</v-icon>
      </v-btn>
    </v-flex>
    <v-flex xs12 v-for='key in Object.keys(changedType)'>
      <v-text-field
        :value='changedType[key]'
        :label='key'
        :readonly='key == "name" ? true : false'
        v-on:input="onChange(key, $event)"
      >
      </v-text-field>
    </v-flex>
  </v-card>
  </v-flex>
</template>

<script>
export default {
  props: ['type'],
  data() {
    return {
      changedType: Object.assign({}, this.type),
    }
  },
  updated: {
    type() {
      this.changedType = Object.assign({}, this.type);
    },
  },
  methods: {
    onChange(key, value) {
      this.$emit('change', [key, value]);
    },
    onRemove() {
      this.$emit('remove');
    },
  },
};
</script>
