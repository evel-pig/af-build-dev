const fs = require('fs');
const chalk = require('chalk');
const { webpackHotDevClientPath } = require('af-webpack/react-dev-utils');
const utils = require('../utils');

module.exports = function (pluginApi) {
  pluginApi.register('modifyAFWebpackOpts', ({ memo }) => {

    const isDev = process.env.NODE_ENV === 'development';

    const webpackrc = {
      ...memo,
      publicPath: '/',
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

    if (!webpackrc.entry) {
      if (fs.existsSync(utils.paths.tsxEntryPath)) {
        webpackrc.entry = {
          app: [utils.paths.tsxEntryPath],
        };
      } else if (fs.existsSync(utils.paths.jsxEntryPath)) {
        webpackrc.entry = {
          app: [utils.paths.jsxEntryPath],
        };
      } else {
        console.error(`找不到入口,请在 .epigrc 配置入口${chalk.red('entry')}`);
        process.exit(1);
      }
    }

    if (isDev) {
      webpackrc.entry = utils.insertEntry(webpackrc.entry, [webpackHotDevClientPath]);
    }

    return webpackrc;
  });
}