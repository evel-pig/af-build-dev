module.exports = {
  gzip: true,
  plugins: [
    ['epig-plugin-copy-server', {}],
    ['epig-plugin-hd', {}],
    ['epig-plugin-enhance-copy', { from: 'src/assets/copy', to: 'assets' }],
    ['epig-plugin-split-chunks', {
      cacheGroups: {
        test: {
          test: /(@ant-design|antd|rc-)/,
          name: 'antd',
          chunks: 'all',
        },
      }
    }],
    ['epig-plugin-sprite', {
      src: {
        cwd: 'src/assets/icons',
      },
    }]
  ],
  scripts: [{
    src: './start.js',
  }, {
    area: 'body',
    content: 'window.end="end";',
  }],
}