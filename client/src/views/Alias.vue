<template>
  <Alias :query="query" :loadComponent="loadComponent"/>
</template>

<script>
import Vue from 'vue';
import {Alias} from '@dtype/navigation-ui';

export default {
  props: ['query'],
  components: {
    Alias,
  },
  methods: {
    loadComponent(name, component) {
      Vue.component(name, component);
    },
  },
};
</script>
