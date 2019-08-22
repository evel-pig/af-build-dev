const { resolve } = require('path');

module.exports = {
  publicPath: './',
  scripts: [{
    content: 'window.test="test";',
  }],
  plugins: [
    ['epig-plugin-mpa', [{
      mode: 'wap',
      entry: 'src/pages/page1/index.tsx',
      title: 'wap title',
      // htmlName: 'index',
    }, {
      mode: 'pc',
      entry: 'src/pages/page2/index.tsx',
      title: 'pc title',
    }]],
  ],
}