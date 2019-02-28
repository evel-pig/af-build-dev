const { webpackHotDevClientPath } = require('af-webpack/react-dev-utils');
const utils = require('../utils');

module.exports = function (pluginApi) {
  pluginApi.register('modifyAFWebpackOpts', ({ memo }) => {

    const isDev = process.env.NODE_ENV === 'development';

    const webpackrc = {
      ...memo,
      publicPath: '/',
      disableDynamicImport: true,
      urlLoaderExcludes: [/\.html$/], // 避免url-loader打包html文件
      hash: isDev ? false : true,
      extraBabelPlugins: [
        [require.resolve('babel-plugin-import'), { libraryName: 'antd', style: true }],
        [require.resolve('babel-plugin-import'), { libraryName: 'antd-mobile', style: true }, 'antd-mobile'],
        ...(memo.extraBabelPlugins || []),
      ],
    }

    if (webpackrc.entry && isDev) {
      webpackrc.entry = utils.insertEntry(webpackrc.entry, [webpackHotDevClientPath]);
    }

    return webpackrc;
  });
}