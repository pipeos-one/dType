module.exports = {
  configureWebpack: {
    devServer: {
      watchOptions: {
        aggregateTimeout: 600,
        // ignored: ['dist/dtype-*.common.js', 'node_modules'],
        // ignored: /node_modules/,
        poll: 5000,
      },
      // lazy: true,
      // filename: 'src/main.js',
    },
  },
};
