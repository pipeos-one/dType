module.exports = {
  presets: [
    '@vue/app',
  ],
  // https://github.com/vuejs/vue-cli/issues/2746 this somehow solves symlinked modules
  sourceType: 'unambiguous',
  plugins: [
    '@babel/plugin-syntax-dynamic-import',
  ],
};
