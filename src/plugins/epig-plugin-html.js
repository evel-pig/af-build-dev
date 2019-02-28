const { resolve } = require('path');
const fs = require('fs');
const { isPlainObject } = require('lodash');
const utils = require('../utils');

module.exports = function (pluginApi) {
  pluginApi.register('chainWebpackConfig', ({ args: { webpackConfig }, opts = {} }) => {

    let htmlConfigs;
    if (Array.isArray(opts)) {
      htmlConfigs = opts;
    } else {
      let template;
      if (fs.existsSync(resolve(utils.paths.templatePath, 'index.html'))) {
        template = resolve(utils.paths.templatePath, 'index.html');
      }
      htmlConfigs = [{
        inject: true,
        ...(template ? { template } : {}),
        ...(isPlainObject(opts) ? opts : {})
      }]
    }

    htmlConfigs.forEach((config, index) => {
      webpackConfig
        .plugin(`html-webpack-plugin-${index}`)
        .use(require('html-webpack-plugin'), [config]);
    })
  });
}