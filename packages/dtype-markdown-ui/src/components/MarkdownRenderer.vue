<template>
  <v-layout row wrap>
    <v-flex v-bind='{[`xs${xssize}`]: true}' v-if='renderer' style='padding-right:10px;'>
      <vue-simplemde
        v-model='tempContent'
        ref='markdownEditor'
        :configs='configs'
      />
    </v-flex>
    <v-flex v-bind='{[`xs${xssize}`]: true}' v-if='viewer' style='padding-left:10px;'>
      <v-layout row wrap justify-end v-if='!renderer'>
        <v-flex shrink>
          <v-btn icon @click='renderer = true'>
            <v-icon>fa-edit</v-icon>
          </v-btn>
        </v-flex>
      </v-layout>
      <v-flex xs12>
        <div id='content' class='subheading'></div>
      </v-flex>
    </v-flex>
  </v-layout>
</template>

<script>
import {VLayout, VFlex, VBtn, VIcon} from 'vuetify/lib';
import VueSimplemde from 'vue-simplemde';
import marked from 'marked';
import {
  TYPE_PREVIEW,
  enforceMaxLength,
  previewRender,
} from '../utils.js';

export default {
  name: 'MarkdownRenderer',
  props: ['content', 'addition', 'getAliasData'],
  components: {VueSimplemde, VLayout, VFlex, VBtn, VIcon},
  data() {
    return {
      xssize: 12,
      viewer: true,
      renderer: false,
      tempContent: '',
      aliascontent: {},
      configs: {
        indentWithTabs: false,
        previewRender: this.previewRender,
        toolbar: [
          'bold', 'italic', 'heading', '|',
          'quote', 'unordered-list', 'ordered-list', '|',
          'link', 'image', '|', {
            name: 'preview',
            action: () => {
              this.viewer = true;
              this.renderer = false;
            },
            className: 'fa fa-eye',
            title: 'Preview',
          },
          {
            name: 'save',
            action: () => {
              // TODO: check text length
              this.$emit('save', {content: this.tempContent});
            },
            className: 'fa fa-save',
            title: 'Save',
          },
        ],
      },
    };
  },
  mounted() {
    this.setData();
  },
  watch: {
    content() {
      this.setData();
    },
    viewer() {
      this.setViewType();
    },
    renderer() {
      this.setViewType();
    },
    tempContent() {
      this.updatePreview();
    },
    addition() {
      if (this.renderer) {
        let text = `[[${this.addition.alias}]]`;
        if (this.addition.type === 'link') {
          text += '()';
        }
        const doc = this.$refs.markdownEditor.simplemde.codemirror.getDoc();
        const cursor = doc.getCursor();
        doc.replaceRange(text, cursor);
      }
    },
  },
  methods: {
    setData() {
      this.tempContent = this.parseContent();
      this.aliascontent = {};
      this.setViewType();
    },
    setViewType() {
      this.xssize = this.viewer && this.renderer ? 6 : 12;
      if (this.renderer) {
        this.$emit('changeType', false);
      } else {
        this.$emit('changeType', true);
      }
      this.updatePreview();
    },
    updatePreview() {
      if (this.viewer) {
        this.previewRender(this.tempContent, document.getElementById('content'));
      }
      if (this.$refs.markdownEditor) {
        this.$refs.markdownEditor.simplemde.codemirror.setOption('maxLength', 1000);
        this.$refs.markdownEditor.simplemde.codemirror.on('beforeChange', enforceMaxLength);
      }
    },
    parseContent() {
      return this.content ? TYPE_PREVIEW.markdown(this.content) : '';
    },
    previewRender(plainText, preview) {
      previewRender(plainText, this.replaceAlias).then((text) => {
        preview.innerHTML = marked(text);
      });
      return 'Loading...';
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
    replaceAliasLinks(plainText, links) {
      return links.map(link => `[${link}](/#/alias?alias=${link})`);
    },
  },
};
</script>

<style>
  @import '~simplemde/dist/simplemde.min.css';
</style>
