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
      <v-flex xs12 v-if="dtypeData && dtypeData.name === 'markdown'">
        <MarkdownRenderer
          :content="aliasData"
          :addition="selectedAlias"
          :getAliasData="getAliasData"
          @save="saveResource"
          @changeType="changeType"
        />
      </v-flex>
      <v-flex xs12 v-else>
        <p>
          {{parseContent(aliasData)}}
        </p>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import {ethers} from 'ethers';
import marked from 'marked';
import { mapState } from 'vuex';
import {getDataItemByTypeHash} from 'dtype-core/dtype-utils';
import {TYPE_PREVIEW} from '../utils.js';

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
    },
    selectedAlias() {
      if (this.viewer) {
        this.$router.push({path: 'alias', query: {alias: this.selectedAlias.alias}});
      }
    }
  },
  methods: {
    setAlias(alias) {
      this.selectedAlias = alias;
    },
    async setAliasData(url) {
      const {content, dtypeData} = await this.getAliasData(url);
      this.aliasData = content;
      this.dtypeData = dtypeData;
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
    },
    parseContent(content) {
      if (content && this.dtypeData && TYPE_PREVIEW[this.dtypeData.name]) {
        return TYPE_PREVIEW[this.dtypeData.name](content);
      }
      return '';
    }
  }
}
</script>
