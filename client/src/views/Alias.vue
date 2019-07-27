<template>
  <v-container style="margin:5px;max-width: 100%;">
    <v-layout row wrap>
      <v-flex xs12>
        <AliasSelector @alias="setAlias" :linkbtn="viewer ? false : true"/>
      </v-flex>
      <v-flex xs12>
        <MarkdownRenderer
          :content="aliasData"
          :addition="selectedAlias"
          :getAliasData="getAliasData"
          @save="saveResource"
          @changeType="changeType"
        />
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import {ethers} from 'ethers';
import marked from 'marked';
import { mapState } from 'vuex';
import {getDataItemByTypeHash} from '../blockchain';

import AliasSelector from '@/packages/alias/components/AliasSelector';
import MarkdownRenderer from '@/packages/markdown/components/MarkdownRenderer';

// http://192.168.1.140:8080/#/alias?alias=markdown.article1
// http://192.168.1.140:8080/#/alias?alias=markdown.article1

export default {
  props: ['query'],
  components: {
    AliasSelector,
    MarkdownRenderer,
  },
  data: () => ({
    viewer: true,
    domain: '',
    selectedAlias: null,
    aliasData: null,
    dtypeData: null,
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
    }
  },
  methods: {
    setAlias(alias) {
      this.selectedAlias = alias;
    },
    async setAliasData(url) {
      this.aliasData = await this.getAliasData(url);
    },
    async getAliasData(url) {
      this.domain = this.query.alias;
      // TODO: account for all separators & multiple subdomains
      // see replaceAlias commented code
      let parts = url.split('.');
      this.dtypeData = await this.$store.dispatch('getTypeStructByName', {lang: 0, name: parts[0]});

      let identifier = await this.$store.dispatch('parseAlias', {
        dTypeIdentifier: this.dtypeData.typeHash,
        name: parts[1],
        separator: '.',
      });

      let content = await getDataItemByTypeHash(
          this.$store.state.contract,
          this.$store.state.wallet,
          this.dtypeData,
          identifier,
      );
      return content;
    },
    saveResource(data) {
      this.$store.dispatch('saveResource', {dTypeData: this.dtypeData, data, identifier: this.aliasData.typeHash}).then((newidentifier) => {
        this.changeAlias(newidentifier);
      });
    },
    changeAlias(identifier) {
      let parts = this.domain.split('.');
      this.$store.dispatch('setAlias', {
        dTypeIdentifier: this.dtypeData.typeHash,
        separator: '.',
        name: parts[1],
        identifier,
      });
    },
    changeType(viewer) {
      this.viewer = viewer;
    }
  }
}
</script>
