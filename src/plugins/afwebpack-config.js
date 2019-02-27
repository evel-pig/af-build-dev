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

    const afConfig = pluginApi.service.config;

    if (isPlainObject(afConfig.html)) {
      // 注入html插件
      memo.plugins.push(new HtmlWebpackPlugin({
        inject: true,
        template: resolve(utils.paths.templatePath, 'index.html'),
        ...(afConfig.html || {})
      }))
    }

    return memo;
  });
}