const { webpackHotDevClientPath } = require('af-webpack/react-dev-utils');
const utils = require('../utils');

module.exports = function (pluginApi) {
  pluginApi.register('modifyAFWebpackOpts', ({ memo }) => {

    const isDev = process.env.NODE_ENV === 'development';

    const webpackrc = {
      ...memo,
      publicPath: '/',
      disableDynamicImport: false,
      urlLoaderExcludes: [/\.(html|ejs)$/], // 避免url-loader打包html/ejs文件
      hash: isDev ? false : true,
      extraBabelPlugins: [
        [require.resolve('@babel/plugin-syntax-dynamic-import')],
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