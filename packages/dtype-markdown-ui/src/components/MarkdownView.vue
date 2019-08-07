<template>
  <v-layout row wrap>
    <v-flex xs12>
      <div id='content' class='subheading'></div>
    </v-flex>
  </v-layout>
</template>

<script>
import {VLayout, VFlex} from 'vuetify/lib';
import marked from 'marked';
import {
  TYPE_PREVIEW,
  previewRender,
} from '../utils.js';

export default {
  name: 'MarkdownView',
  props: ['content', 'getAliasData'],
  components: {VLayout, VFlex},
  data() {
    return {
      tempContent: '',
      aliascontent: {},
    };
  },
  mounted() {
    this.setData();
  },
  watch: {
    content() {
      this.setData();
    },
  },
  methods: {
    setData() {
      this.tempContent = this.content ? TYPE_PREVIEW.markdown(this.content) : '';
      this.aliascontent = {};
      this.updatePreview();
    },
    updatePreview() {
      previewRender(this.tempContent, this.replaceAlias).then((text) => {
        document.getElementById('content').innerHTML = marked(text);
      });
    },
    async replaceAlias(aliases) {
      const aliasobjs = [];
      for (let i = 0; i < aliases.length; i++) {
        const alias = aliases[i];
        // const separators = [...alias.matchAll(/[.\/#\@]+/g)];
        // const components = alias.split(/[.\/#\@]+/g);
        // console.log('separators', separators);
        // console.log('components', components);
        // // TODO: account for @ & multiple subdomains
        // // return this.replaceAlias(components[0], components[1], separators[0][0]);
        // const data = await this.$store.dispatch('getAliasData', {
        //   dTypeIdentifier: this.aliases[components[0]].identifier,
        //   separator: separators[0][0],
        //   name: components[1],
        // });
        if (!this.aliascontent[alias]) {
          const {content, dtypeData} = await this.getAliasData(alias);
          this.aliascontent[alias] = TYPE_PREVIEW[dtypeData.name](content);
        }
        aliasobjs.push(this.aliascontent[alias]);
      }
      return aliasobjs;
    },
  },
};
</script>
