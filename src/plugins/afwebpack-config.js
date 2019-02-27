const HtmlWebpackPlugin = require('html-webpack-plugin');
const { isPlainObject } = require('lodash');
const { resolve } = require('path');
const { webpackHotDevClientPath } = require('af-webpack/react-dev-utils');
const utils = require('../utils');

module.exports = function (pluginApi) {
  pluginApi.register('modifyWebpackConfig', ({ memo }) => {

    const isDev = process.env.NODE_ENV === 'development';

    if (memo.entry && isDev) {
      memo.entry = utils.insertEntry(memo.entry, [webpackHotDevClientPath]);
    }

    const afRc = pluginApi.service.config;

    if (isPlainObject(afRc.html)) {
      // 注入html插件
      memo.plugins.push(new HtmlWebpackPlugin({
        inject: true,
        template: resolve(utils.paths.publicPath, 'index.html'),
        ...(afRc.html || {})
      }))
    }

    return memo;
  });
}