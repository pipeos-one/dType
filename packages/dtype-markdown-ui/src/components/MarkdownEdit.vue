<template>
  <v-layout row wrap>
    <v-flex xs6 style='padding-right:10px;'>
      <vue-simplemde
        v-model='tempContent'
        ref='markdownEditor'
        :configs='configs'
      />
    </v-flex>
    <v-flex xs6 style='padding-left:10px;'>
      <v-flex xs12>
        <MarkdownView :content="{content: tempContent}" :getAliasData="getAliasData"/>
      </v-flex>
    </v-flex>
  </v-layout>
</template>

<script>
import {VLayout, VFlex} from 'vuetify/lib';
import VueSimplemde from 'vue-simplemde';
import {TYPE_PREVIEW} from '../utils.js';
import MarkdownView from './MarkdownView';

export default {
  name: 'MarkdownEdit',
  props: ['content', 'addition', 'getAliasData'],
  components: {VueSimplemde, VLayout, VFlex, MarkdownView},
  data() {
    return {
      tempContent: '',
      configs: {
        indentWithTabs: false,
        toolbar: [
          'bold', 'italic', 'heading', '|',
          'quote', 'unordered-list', 'ordered-list', '|',
          'link', 'image', '|', {
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
    addition() {
      let text = `[[${this.addition.alias}]]`;
      if (this.addition.type === 'link') {
        text += '()';
      }
      const doc = this.$refs.markdownEditor.simplemde.codemirror.getDoc();
      const cursor = doc.getCursor();
      doc.replaceRange(text, cursor);
    },
  },
  methods: {
    setData() {
      this.tempContent = this.content ? TYPE_PREVIEW.markdown(this.content) : '';
    },
  },
};
</script>

<style>
  @import '~simplemde/dist/simplemde.min.css';
</style>
