<template>
  <v-app>
    <v-content>
      <div>
        <router-link to="/">dType</router-link>
      </div>
      <router-view></router-view>
    </v-content>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  created() {
    this.setData();
  },
  destroyed() {
    this.$store.dispatch('removeWatchers');
  },
  methods: {
    async setData() {
      await this.$store.dispatch('setProvider');
      await this.$store.dispatch('setContract');
      await this.$store.dispatch('setTypes');
      this.$store.dispatch('watchAll');
    },
  },
};
</script>
