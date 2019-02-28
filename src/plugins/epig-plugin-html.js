const { resolve } = require('path');
const { isPlainObject } = require('lodash');
const utils = require('../utils');

module.exports = function (pluginApi) {
  pluginApi.register('chainWebpackConfig', ({ args: { webpackConfig } }) => {

    const epigConfig = pluginApi.service.config;

    let htmlConfigs;
    if (Array.isArray(epigConfig.html)) {
      htmlConfigs = epigConfig.html;
    } else {
      htmlConfigs = [{
        inject: true,
        template: resolve(utils.paths.templatePath, 'index.html'),
        ...(isPlainObject(isPlainObject) ? epigConfig.html : {})
      }]
    }

    htmlConfigs.forEach((config, index) => {
      webpackConfig
        .plugin(`html-webpack-plugin-${index}`)
        .use(require('html-webpack-plugin'), [config]);
    })
  });
}