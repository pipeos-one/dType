<template>
  <v-layout row wrap>
    <v-flex xs1>
      <v-subheader>Alias</v-subheader>
    </v-flex>
    <v-flex xs4 style="padding-right: 10px;">
      <v-autocomplete
        v-model="selectType"
        label="Type"
        :items="Object.keys(aliases)"
        :loading="loadingTypes"
        :search-input.sync="searchType"
        hide-no-data
        hide-details
        placeholder="Search"
        dense
      ></v-autocomplete>
    </v-flex>
    <v-flex xs1 style="padding-left: 5px;padding-right: 5px;">
      <v-select
        v-model="selectSeparator"
        :items="['.', '/', '#', '@']"
        placeholder="Separator"
        dense
        hide-selected
        class="font-weight-bold display-1 text-center"
      ></v-select>
    </v-flex>
    <v-flex xs4 style="padding-left: 10px;">
      <v-autocomplete
        v-model="selectItem"
        label="Resource"
        :items="selectType ? Object.keys(aliases[selectType][selectSeparator]) : []"
        :loading="loadingItems"
        :search-input.sync="searchItem"
        hide-no-data
        hide-details
        placeholder="Search"
        dense
      ></v-autocomplete>
    </v-flex>
    <v-flex xs2>
      <v-btn icon @click="onGo" :disabled="(selectType && selectItem) ? false : 'disabled'">
        <v-icon>fa-chevron-right</v-icon>
      </v-btn>
    </v-flex>
  </v-layout>
</template>

<script>
import { mapState } from 'vuex';

export default {
  data: () => ({
    domain: '',
    selectType: null,
    searchType: null,
    loadingTypes: false,
    selectItem: null,
    searchItem: null,
    loadingItems: false,
    selectSeparator: '.',
  }),
  computed: mapState({
      alias: 'alias',
      aliases: 'aliases',
  }),
  mounted() {
    this.setData();
  },
  destroyed() {
    this.$store.dispatch('removeWatchersAlias');
  },
  watch: {
    alias() {
      this.setData();
    },
  },
  methods: {
    setData() {
      if (this.alias) {
        this.$store.dispatch('watchAllAlias');
      }
    },
    onGo() {
      const alias = this.selectType + this.selectSeparator + this.selectItem;
      const components = [
        {name: this.selectType, identifier: this.aliases[this.selectType], type: 'dtype'},
        {name: this.selectSeparator, type: 'separator'},
        {name: this.selectItem, identifier: this.aliases[this.selectType][this.selectSeparator][this.selectItem], type: 'item'},
      ];
      this.$emit('alias', {alias, components});
    }
  }
}
</script>
