<template>
  <v-app>
    <v-content>
      <div>
        <router-link to="/">dType</router-link>
      </div>
      <router-view v-if="dataIsSet"></router-view>
    </v-content>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {dataIsSet: false};
  },
  created() {
    this.setData();
  },
  destroyed() {
    // TODO: move in dtype landing page
    this.$store.dispatch('dtype/removeWatchers');
  },
  methods: {
    async setData() {
      await this.$store.dispatch('dtype/setProvider');
      await this.$store.dispatch('dtype/setContract');
      this.$store.commit('alias/setProvider', this.$store.state.dtype.provider);
      this.$store.commit('alias/setWallet', this.$store.state.dtype.wallet);
      this.$store.commit('alias/setdType', this.$store.state.dtype.contract);
      await this.$store.dispatch('alias/setContract');

      // TODO: move dtype watcher in dtype landing page
      await this.$store.dispatch('dtype/setTypes');
      this.$store.dispatch('dtype/watchAll');

      this.dataIsSet = true;
    },
  },
};
</script>
