const { resolve } = require('path');

module.exports = {
  gzip: true,
  scripts: [{
    content: 'window.test="test";',
  }],
  plugins: [
    ['epig-plugin-mpa', [{
      entry: 'src/pages/index/index.tsx',
      title: 'wap title',
    }, {
      entry: 'src/pages/page2/index.tsx',
      mode: 'pc',
      title: 'pc title',
    }]],
  ],
}