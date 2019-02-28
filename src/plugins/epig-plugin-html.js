const { resolve } = require('path');
const { isPlainObject } = require('lodash');
const utils = require('../utils');

module.exports = function (pluginApi) {
  pluginApi.register('chainWebpackConfig', ({ args: { webpackConfig } }) => {

    const epigConfig = pluginApi.service.config;

    let htmlConfig;

    if (epigConfig.html && isPlainObject(epigConfig.html)) {
      htmlConfig = [{
        inject: true,
        template: resolve(utils.paths.templatePath, 'index.html'),
        ...(epigConfig.html || {})
      }]
    }

    webpackConfig
      .plugin('html-webpack-plugin')
      .use(require('html-webpack-plugin'), htmlConfig);

  });
}