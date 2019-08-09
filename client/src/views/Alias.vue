<template>
  <Alias :query="query"/>
</template>

<script>
import {Alias} from '@dtype/navigation-ui';

export default {
  props: ['query'],
  components: {
    Alias,
  },
};
</script>
