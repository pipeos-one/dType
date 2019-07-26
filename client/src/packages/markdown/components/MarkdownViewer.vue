<template>
  <div>
    <div id="content" class="subheading"></div>
  </div>
</template>

<script>
import marked from 'marked';
import {TYPE_PREVIEW} from '../utils.js';

export default {
  props: ['content'],
  watch: {
    content() {
      if (this.content) {
        document.getElementById('content').innerHTML = marked(TYPE_PREVIEW.markdown(this.content));
      }
    }
  },
}
</script>
