<template>
  <v-layout row wrap>
    <v-flex xs4 style="padding-right: 10px;">
      <v-autocomplete
        v-model="selectType"
        label="type alias"
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
        label="resource alias"
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
      <v-btn icon @click="onGo('include')" :disabled="(selectType && selectItem) ? false : 'disabled'">
        <v-icon>fa-chevron-right</v-icon>
      </v-btn>
      <v-btn v-if="linkbtn" icon @click="onGo('link')" :disabled="(selectType && selectItem) ? false : 'disabled'">
        <v-icon>fa-link</v-icon>
      </v-btn>
    </v-flex>
  </v-layout>
</template>

<script>
import { mapState } from 'vuex';

export default {
  props: ['linkbtn', 'initial'],
  data: () => ({
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
    initial() {
      setTimeout(this.setInitial, 500);
    }
  },
  methods: {
    setData() {
      if (!this.alias) return;
      this.$store.dispatch('watchAllAlias');
      setTimeout(this.setInitial, 6000);
    },
    setInitial() {
      if (!this.initial || Object.keys(this.aliases).length == 0) return;
      const parts = this.initial.split('.');

      if (!this.aliases[parts[0]]['.'][parts[1]]) {
        this.aliases[parts[0]]['.'][parts[1]] = '0x0000000000000000000000000000000000000000000000000000000000000000';
      }
      this.selectType = parts[0];
      this.selectSeparator = '.';
      this.selectItem = parts[1];
    },
    onGo(type) {
      const alias = this.selectType + this.selectSeparator + this.selectItem;
      const components = [
        {name: this.selectType, identifier: this.aliases[this.selectType], type: 'dtype'},
        {name: this.selectSeparator, type: 'separator'},
        {name: this.selectItem, identifier: this.aliases[this.selectType][this.selectSeparator][this.selectItem], type: 'item'},
      ];
      this.$emit('alias', {alias, components, type});
    }
  }
}
</script>
