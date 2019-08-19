module.exports = {
  plugins: [
    () => { },
    function test() { },
    'epig-plugin-html',
    ['epig-plugin-copy-server'],
    ['epig-plugin-split-chunks', {
      cacheGroups: {
        test: {
          test: /(@ant-design|antd|rc-)/,
          name: 'antd',
          chunks: 'all',
        },
      }
    }],
    [(api, opts) => { console.log(opts) }, { test: 'test' }],
  ]
}