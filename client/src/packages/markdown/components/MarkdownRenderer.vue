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
          const {included, links} = getAliasesFromMd(plainText);
          console.log('previewRender aliases', included, links);

          // Replace links before included aliases
          plainText = replaceAliasesMd(
            plainText,
            links.full,
            this.replaceAliasLinks(plainText, links.aliases),
          );
          this.replaceAlias(included.aliases).then((aliasobjs) => {
            plainText = replaceAliasesMd(plainText, included.full, aliasobjs);
            preview.innerHTML = marked(plainText);
          });
          return 'Loading...';
        },
        toolbar: [
          "bold", "italic", "heading", "|",
          "quote", "unordered-list", "ordered-list", "|",
          "link", "image", "|",
          "preview", "side-by-side", "fullscreen", "|", {
            name: "save",
            action: (editor) => {
              this.$emit('save', {content: this.tempContent});
            },
            className: "fa fa-save",
            title: "Save",
          }
        ],
      },
    }
  },
  computed: mapState({
      aliases: 'aliases',
      simplemde() {
        return this.$refs.markdownEditor.simplemde;
      }
  }),
  mounted() {
    this.setData();

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
      this.setData();
    },
    addition() {
      let text = `[[${this.addition.alias}]]`;
      if (this.addition.type == 'link') {
        text += '()';
      }
      var doc = this.simplemde.codemirror.getDoc();
      var cursor = doc.getCursor();
      doc.replaceRange(text, cursor);
    },
  },
  methods: {
    setData() {
      // document.getElementsByClassName('editor-preview')[0].innerText = '';
      this.tempContent = this.parseContent();
      this.aliascontent = {};
      this.simplemde.togglePreview();
    },
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
    },
    replaceAliasLinks(plainText, links) {
      return links.map(link => `[${link}](/#/alias?alias=${link}&view=renderer)`);
    }
  }
}
</script>

<style>
  @import '~simplemde/dist/simplemde.min.css';
</style>
