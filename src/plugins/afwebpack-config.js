const fs = require('fs');
const chalk = require('chalk');
const { webpackHotDevClientPath } = require('af-webpack/react-dev-utils');
const utils = require('../utils');

module.exports = function (pluginApi) {
  pluginApi.register('modifyAFWebpackOpts', ({ memo }) => {

    const isDev = process.env.NODE_ENV === 'development';

    // 可将 .epigrc 里面除了(chainWebpack,plugins,targets,treeShaking)配置项外合并到webpackOpts中;
    const { chainWebpack, plugins, targets, treeShaking, ...rest } = pluginApi.service.config;

    const babelTargets = {
      chrome: 49,
      firefox: 64,
      safari: 10,
      edge: 13,
      ios: 10,
      ...(targets || {}),
    };

    const webpackrc = {
      publicPath: '/',
      ignoreMomentLocale: true,
      disableDynamicImport: false,
      hash: isDev ? false : true,
      ...memo, // .webpackrc.js 配置项
      ...rest, // .epigrc.js配置项
      urlLoaderExcludes: [
        /\.(html|ejs|txt)$/,
        ...(memo.urlLoaderExcludes || []),
        ...(rest.urlLoaderExcludes || []),
      ], // 避免url-loader打包html/ejs/txt文件;
      extraBabelPresets: [
        [
          require.resolve('babel-preset-umi'),
          {
            targets: babelTargets,
            env: {
              useBuiltIns: 'entry',
              ...(treeShaking ? { modules: false } : {}),
            },
          },
        ],
        ...(memo.extraBabelPresets || []),
        ...(rest.extraBabelPresets || []),
      ],
      extraBabelPlugins: [
        [require.resolve('babel-plugin-import'), { libraryName: 'antd', style: true }],
        [require.resolve('babel-plugin-import'), { libraryName: 'antd-mobile', style: true }, 'antd-mobile'],
        ...(memo.extraBabelPlugins || []),
        ...(rest.extraBabelPlugins || []),
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

    if (webpackrc.entry) {
      if (isDev) {
        webpackrc.entry = utils.insertEntry(webpackrc.entry, ['@babel/polyfill', webpackHotDevClientPath]);
      } else {
        webpackrc.entry = utils.insertEntry(webpackrc.entry, ['@babel/polyfill'])
      }
    }

    return webpackrc;
  });

  pluginApi.register('chainWebpackConfig', ({ args: { webpackConfig }, opts = [] }) => {
    webpackConfig.module
      .rule('txt')
      .test(/\.txt?$/)
      .use('raw-loader')
      .loader(require.resolve('raw-loader'));
  });
}