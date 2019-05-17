const path = require('path');
module.exports = {
  plugins: [
    ['epig-plugin-hd', { inject: true }],
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
        cwd: path.resolve(__dirname, './src/assets/icons'),
      },
    }]
  ]
}