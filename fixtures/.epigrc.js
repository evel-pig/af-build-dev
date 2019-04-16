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
    ['epig-plugin-hd'],
  ]
}