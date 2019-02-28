const { resolve } = require('path');
const { isPlainObject } = require('lodash');
const utils = require('../utils');

module.exports = function (pluginApi) {
  pluginApi.register('chainWebpackConfig', ({ args: { webpackConfig } }) => {

    const epigConfig = pluginApi.service.config;

    webpackConfig
      .plugin('html-webpack-plugin')
      .use(require('html-webpack-plugin'), [{
        inject: true,
        template: resolve(utils.paths.templatePath, 'index.html'),
        ...(isPlainObject(isPlainObject) ? epigConfig.html : {})
      }]);

  });
}