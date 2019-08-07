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
      <v-flex xs12>
        <component
          :is="dynamicComponent"
          v-bind="{content: aliasData, addition: selectedAlias, getAliasData: getAliasData}"
          @save="saveResource"
          @changeType="changeType"
        ></component>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import Vue from 'vue';
import {mapState} from 'vuex';
import {getDataItemByTypeHash} from '@dtype/core';
import {TYPE_PREVIEW} from '../utils.js';

import AliasSelector from '@/packages/alias/components/AliasSelector';
// import 'dtype-markdown-ui/dist/dtype-markdown-ui.css';

// http://192.168.1.140:8080/#/alias?alias=markdown.article1
// http://192.168.1.140:8080/#/alias?alias=markdown.article1

const getUIPackage = async (packageName) => {
  const pack = await import(
    /* webpackChunkName: 'dynamicComponent' */
    /* webpackMode: "lazy" */
    `../../node_modules/@dtype/${packageName}-ui/dist/dtype-${packageName}-ui.common.js`
  ).catch(console.log);

  if (pack) {
    await import(
      /* webpackChunkName: 'dynamicComponent' */
      /* webpackMode: "lazy" */
      `../../node_modules/@dtype/${packageName}-ui/dist/dtype-${packageName}-ui.css`
    ).catch(console.log);
  }

  return pack;
}

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
    dynamicComponent: null,
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
  },
  methods: {
    setAlias(alias) {
      this.selectedAlias = alias;
    },
    async setAliasData(url) {
      const {content, dtypeData} = await this.getAliasData(url);
      this.aliasData = content;
      this.dtypeData = dtypeData;
      this.setDynamicComponent();
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
    saveResource(data) {
      this.$store.dispatch('saveResource', {dTypeData: this.dtypeData, data, identifier: this.aliasData.typeHash}).then((newidentifier) => {
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
    changeType(viewer) {
      this.viewer = viewer;
    },
    parseContent(content) {
      if (content && this.dtypeData && TYPE_PREVIEW[this.dtypeData.name]) {
        return TYPE_PREVIEW[this.dtypeData.name](content);
      }
      return '';
    },
    async setDynamicComponent() {
      let uiPackage = await getUIPackage(this.dtypeData.name);
      if (!uiPackage) {
        uiPackage = await getUIPackage('default');
      }
      const {getComponent} = uiPackage;
      const component = getComponent('view');
      Vue.component(component.name, component);
      this.dynamicComponent = component.name;
    },
  },
};
</script>
