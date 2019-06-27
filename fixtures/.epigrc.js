function pluginTest(api, opts) {
  console.log('plugin test:', opts);
}

module.exports = {
  alias: {
    react: 'preact',
  },
  plugins: [
    [pluginTest, { test: '123' }],
    ['epig-plugin-admin', { noAutoEntry: true, noAutoRoute: true, noAutoModel: true }],
    ['epig-plugin-split-chunks', {
      cacheGroups: {
        test: {
          test: /(@ant-design|antd|rc-)/,
          name: 'antd',
          chunks: 'all',
        },
      }
    }],
    ['epig-plugin-hd'],
  ]
}