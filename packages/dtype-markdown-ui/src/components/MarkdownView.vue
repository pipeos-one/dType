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
  typePreview,
  previewRender,
} from '../utils.js';

export default {
  name: 'MarkdownView',
  props: ['value', 'getAliasData'],
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
    value() {
      this.setData();
    },
  },
  methods: {
    setData() {
      this.tempContent = this.value ? TYPE_PREVIEW.markdown(this.value) : '';
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
          this.aliascontent[alias] = await this.getAliasData(alias);
        }

        // TODO move this in a utility that knows how to handle each type
        const parts = alias.split('.').slice(2);
        const parsed = typePreview(
          this.aliascontent[alias].dtypeData.name,
          this.aliascontent[alias].content,
        );

        if (parts.length === 0) {
          aliasobjs.push(parsed);
        } else {
          let replacement = Object.assign({}, this.aliascontent[alias].content);
          for (let j = 0; j < parts.length; j++) {
            if (replacement) replacement = replacement[parts[j]];
          }
          aliasobjs.push(replacement);
        }
      }
      return aliasobjs;
    },
  },
};
</script>
