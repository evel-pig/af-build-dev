const fs = require('fs');
const chalk = require('chalk');
const { webpackHotDevClientPath } = require('af-webpack/react-dev-utils');
const utils = require('../utils');

module.exports = function (pluginApi) {
  pluginApi.register('modifyAFWebpackOpts', ({ memo }) => {

    const isDev = process.env.NODE_ENV === 'development';

    // 可将 .epigrc 里面除了(chainWebpack,plugins)配置项外合并到webpackOpts中;
    const { chainWebpack, plugins, ...rest } = pluginApi.service.config;

    const webpackrc = {
      ...memo, // .webpackrc.js 配置项
      ...rest, // .epigrc.js配置项
      publicPath: '/',
      ignoreMomentLocale: true,
      disableDynamicImport: false,
      urlLoaderExcludes: [/\.(html|ejs)$/], // 避免url-loader打包html/ejs文件;
      hash: isDev ? false : true,
      extraBabelPlugins: [
        [require.resolve('@babel/plugin-syntax-dynamic-import')],
        [require.resolve('babel-plugin-import'), { libraryName: 'antd', style: true }],
        [require.resolve('babel-plugin-import'), { libraryName: 'antd-mobile', style: true }, 'antd-mobile'],
        ...(memo.extraBabelPlugins || []),
      ],
    }

    // 自动注册入口
    if (!webpackrc.entry) {
      if (fs.existsSync(utils.paths.tsxEntryPath)) {
        webpackrc.entry = {
          app: [utils.paths.tsxEntryPath],
        };
      } else if (fs.existsSync(utils.paths.jsxEntryPath)) {
        webpackrc.entry = {
          app: [utils.paths.jsxEntryPath],
        };
      }
    }

    if (webpackrc.entry && isDev) {
      webpackrc.entry = utils.insertEntry(webpackrc.entry, [webpackHotDevClientPath]);
    }

    return webpackrc;
  });
}