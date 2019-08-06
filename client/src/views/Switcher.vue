<template>
  <component :is="dynamicComponent"></component>
</template>

<script>
import Vue from 'vue';

const getUIPackage = async (packageName) => {
    packageName = packageName + '-ui';
    console.log('../../node_modules/@dtype/' + packageName);
    const pack = await import(
      /* webpackChunkName: 'dynamicComponent' */
      /* webpackMode: "lazy" */
      '../../node_modules/@dtype/' + packageName + `/dist/dtype-${packageName}.common.js`
    ).catch(console.log);

    return pack;
}

export default {
  props: ['dtypeName'],
  data() {
    return {
      dynamicComponent: null,
    }
  },
  mounted() {
    this.setComponent();
  },
  watch: {
    dtypeName() {
      this.setComponent();
    },
  },
  methods: {
    async setComponent() {
      const uiPackage = await getUIPackage(this.dtypeName);
      console.log('uiPackage', uiPackage);
      // this.dynamicComponent
    }
  }
};
</script>
