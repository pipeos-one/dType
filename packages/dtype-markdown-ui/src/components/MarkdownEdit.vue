<template>
  <v-layout row wrap>
    <v-flex xs6 style='padding-right:10px;'>
      <vue-simplemde
        v-model='editorContent'
        ref='markdownEditor'
        :configs='configs'
      />
    </v-flex>
    <v-flex xs6 style='padding-left:10px;'>
      <v-flex xs12>
        <MarkdownView :value="{content: editorContent}" :getAliasData="getAliasData"/>
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
  props: ['value', 'addition', 'getAliasData'],
  components: {VueSimplemde, VLayout, VFlex, MarkdownView},
  data() {
    return {
      editorContent: '',
      configs: {
        indentWithTabs: false,
        toolbar: [
          'bold', 'italic', 'heading', '|',
          'quote', 'unordered-list', 'ordered-list', '|',
          'link', 'image',
        ],
      },
    };
  },
  mounted() {
    this.setData();
  },
  watch: {
    value() {
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
    editorContent() {
      const value = this.value ? TYPE_PREVIEW.markdown(this.value) : '';
      if (this.editorContent !== value) {
        this.$emit('input', {content: this.editorContent});
      }
    },
  },
  methods: {
    setData() {
      this.editorContent = this.value ? TYPE_PREVIEW.markdown(this.value) : '';
    },
  },
};
</script>

<style>
  @import '~simplemde/dist/simplemde.min.css';
</style>
