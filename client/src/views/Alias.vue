<template>
  <v-container style="margin:5px;max-width: 100%;">
    <v-layout row wrap>
      <v-flex xs12>
        <AliasSelector
          :initial="viewer ? domain : null"
          :linkbtn="viewer ? false : true"
          @alias="setAlias"
        />
      </v-flex>
      <v-layout row wrap justify-end>
        <v-flex shrink>
          <v-btn icon v-if="!viewer">
            <v-icon @click="saveResource">fa-save</v-icon>
          </v-btn>
          <v-btn icon>
            <v-icon v-if="viewer" @click="viewer = false">fa-edit</v-icon>
            <v-icon v-else @click="viewer = true">fa-eye</v-icon>
          </v-btn>
        </v-flex>
      </v-layout>
      <v-flex xs12>
        <component
          :is="dynamicComponent"
          v-model="dynamicComponentData"
          :addition="selectedAlias"
          :getAliasData="getAliasData"
          @save="saveResource"
        ></component>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import Vue from 'vue';
import {mapState} from 'vuex';
import {getDataItemByTypeHash, getUIPackage} from '@dtype/core';
import {TYPE_PREVIEW} from '../utils.js';

import AliasSelector from '@/packages/alias/components/AliasSelector';

// http://192.168.1.140:8080/#/alias?alias=markdown.article1
// http://192.168.1.140:8080/#/alias?alias=markdown.article1

export default {
  props: ['query'],
  components: {
    AliasSelector,
  },
  data: () => ({
    viewer: true,
    domain: '',
    selectedAlias: null,
    aliasData: null,
    dtypeData: null,
    dynamicPackage: null,
    dynamicComponent: null,
    dynamicComponentData: null,
  }),
  computed: mapState({
    alias: 'alias',
  }),
  mounted() {
    if (this.query) {
      this.setAliasData(this.query.alias);
    }
  },
  watch: {
    query() {
      if (this.query && this.alias) {
        this.setAliasData(this.query.alias);
      }
    },
    alias() {
      if (this.query && this.alias) {
        this.setAliasData(this.query.alias);
      }
    },
    selectedAlias() {
      if (this.viewer) {
        this.$router.push({path: 'alias', query: {alias: this.selectedAlias.alias}});
      }
    },
    viewer() {
      if (!this.dynamicPackage) return;
      this.setDynamicComponent();
    },
    aliasData() {
      this.dynamicComponentData = this.aliasData;
    },
  },
  methods: {
    setAlias(alias) {
      this.selectedAlias = alias;
    },
    async setAliasData(url) {
      const {content, dtypeData} = await this.getAliasData(url);
      this.aliasData = content;
      this.dtypeData = dtypeData;
      this.setDynamicPackage();
    },
    async getAliasData(url) {
      this.domain = this.query.alias;
      // TODO: account for all separators & multiple subdomains
      // see replaceAlias commented code
      const parts = url.split('.');
      const dtypeData = await this.$store.dispatch('getTypeStruct', {lang: 0, name: parts[0]});

      const identifier = await this.$store.dispatch('parseAlias', {
        dTypeIdentifier: dtypeData.typeHash,
        name: parts[1],
        separator: '.',
      });

      const content = await getDataItemByTypeHash(
        this.$store.state.contract,
        this.$store.state.wallet,
        dtypeData,
        identifier,
      );
      return {content, dtypeData};
    },
    saveResource() {
      this.$store.dispatch('saveResource', {dTypeData: this.dtypeData, data: this.dynamicComponentData, identifier: this.aliasData.typeHash}).then((newidentifier) => {
        this.changeAlias(newidentifier);
      });
    },
    changeAlias(identifier) {
      const parts = this.domain.split('.');
      this.$store.dispatch('setAlias', {
        dTypeIdentifier: this.dtypeData.typeHash,
        separator: '.',
        name: parts[1],
        identifier,
      });
    },
    parseContent(content) {
      if (content && this.dtypeData && TYPE_PREVIEW[this.dtypeData.name]) {
        return TYPE_PREVIEW[this.dtypeData.name](content);
      }
      return '';
    },
    async setDynamicPackage() {
      let uiPackage = await getUIPackage(this.dtypeData.name);
      if (!uiPackage) {
        uiPackage = await getUIPackage('default');
      }
      this.dynamicPackage = uiPackage;
      console.log('uiPackage', uiPackage);
      this.setDynamicComponent();
    },
    setDynamicComponent() {
      const {getComponent} = this.dynamicPackage;
      const componentType = this.viewer ? 'view' : 'edit';
      const component = getComponent(componentType);
      console.log('componentName', component.name, component);
      Vue.component(component.name, component);
      this.dynamicComponent = component.name;
    },
  },
};
</script>
