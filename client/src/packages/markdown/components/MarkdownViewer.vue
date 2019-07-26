<template>
  <div>
    <div id="content" class="subheading"></div>
  </div>
</template>

<script>
import {ethers} from 'ethers';
import marked from 'marked';

export default {
  props: ['content'],
  watch: {
    content() {
      if (this.content) {
        document.getElementById('content').innerHTML = marked(ethers.utils.toUtf8String(this.content.content));
      }
    }
  },
}
</script>
