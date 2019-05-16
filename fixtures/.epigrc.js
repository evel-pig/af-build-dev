function pluginTest(pluginApi) {
  pluginApi.register('register', () => {
  });
}

module.exports = {
  alias: {
    react: 'preact',
  },
  plugins: [
    [pluginTest],
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