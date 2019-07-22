<template>
  <v-container>
    <v-layout row wrap>
      <v-flex xs1>
        <v-subheader>Alias</v-subheader>
      </v-flex>
      <v-flex xs11 sm6 md6>
          <v-text-field
            v-model="domain"
            solo
            append-outer-icon="fa-arrow-alt-circle-right"
            @click:append-outer="onGo"
          ></v-text-field>
      </v-flex>
      <v-flex xs12>
        <div id="content" class="subheading"></div>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import {ethers} from 'ethers';
import marked from 'marked';
import { mapState } from 'vuex';
import {getDataItemByTypeHash} from '../blockchain';
// markdown.article1
export default {
  props: ['query'],
  data: () => ({
    domain: '',
  }),
  computed: mapState({
      alias: 'alias',
  }),
  mounted() {
    if (this.query) {
      this.getAliasData(this.query.alias);
    }
  },
  watch: {
    query() {
      console.log('query', this.query);
      if (this.query && this.alias) {
        console.log('hh query');
        this.getAliasData(this.query.alias);
      }
    },
    alias() {
      console.log('alias', this.$store.state.alias);
      if (this.query && this.alias) {
        console.log('hh alias');
        this.getAliasData(this.query.alias);
      }
    }
  },
  methods: {
    async getAliasData(url) {
      this.domain = this.query.alias;
      let parts = url.split('.');
      let dtypeData = await this.$store.dispatch('getTypeStructByName', {lang: 0, name: parts[0]});
      console.log('dtypeData', dtypeData);
      let identifier = await this.$store.dispatch('parseAlias', {
        dTypeIdentifier: dtypeData.typeHash,
        name: parts[1],
        separator: '.',
      });
      console.log('getAliasData', identifier);
      let content = await getDataItemByTypeHash(
          this.$store.state.contract,
          this.$store.state.wallet,
          dtypeData,
          identifier,
      );
      console.log('content', content);
      document.getElementById('content').innerHTML = marked(ethers.utils.toUtf8String(content.content));
    },
    onGo() {
      this.$router.push({ path: 'alias', query: { alias: this.domain } });
    }
  }
}
</script>
