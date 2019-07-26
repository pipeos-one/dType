<template>
  <div>
    <vue-simplemde
      v-model="tempContent"
      ref="markdownEditor"
      :configs="configs"
    />
  </div>
</template>

<script>
import VueSimplemde from 'vue-simplemde';
import marked from 'marked';
import { mapState } from 'vuex';
import {getAliasesFromMd, replaceAliasesMd, TYPE_PREVIEW} from '../utils.js';

export default {
  props: ['content', 'addition', 'getAliasData'],
  components: {VueSimplemde},
  data() {
    return {
      tempContent: '',
      aliascontent: {},
      configs: {
        // hideIcons: [],
        // showIcons: [],
        // status: [],
        // toolbar: false,
        indentWithTabs: false,
        // previewRender
        // renderingConfig: {codeSyntaxHighlighting: true},
        previewRender: (plainText, preview) => {
          const aliases = getAliasesFromMd(plainText);
          console.log('aliases', aliases);
          this.replaceAlias(aliases).then((aliasobjs) => {
            plainText = replaceAliasesMd(plainText, aliasobjs);
            preview.innerHTML = marked(plainText);
          });
          return 'Loading...';
        },
      }
    }
  },
  computed: mapState({
      aliases: 'aliases',
      simplemde() {
        return this.$refs.markdownEditor.simplemde;
      }
  }),
  mounted() {
    this.tempContent = this.parseContent();

    // editor-toolbar fullscreen
    // this.simplemde.codemirror.on("optionChange", (instance, option) => {
    //   setTimeout(() => {
    //     console.log('isSideBySideActive', this.simplemde.isSideBySideActive());
    //     console.log('isFullscreenActive', this.simplemde.isFullscreenActive());
    //     if (this.simplemde.isSideBySideActive() && this.simplemde.isFullscreenActive()) {
    //       this.simplemde.toggleFullScreen();
    //     }
    //   }, 500);
    // });
  },
  watch: {
    content() {
      this.tempContent = this.parseContent();
      this.aliascontent = {};
    },
    addition() {
      var doc = this.simplemde.codemirror.getDoc();
      var cursor = doc.getCursor();
      doc.replaceRange(`[[${this.addition.alias}]]`, cursor);
    },
  },
  methods: {
    parseContent() {
      return this.content ? TYPE_PREVIEW.markdown(this.content) : '';
    },
    async replaceAlias(aliases) {
      let aliasobjs = [];

      for (let alias of aliases) {
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
          const type = alias.split('.')[0];
          const data = await this.getAliasData(alias);
          this.aliascontent[alias] = TYPE_PREVIEW[type](data);
        }
        aliasobjs.push(this.aliascontent[alias]);
      }
      return aliasobjs;
    }
  }
}
</script>

<style>
  @import '~simplemde/dist/simplemde.min.css';
</style>
