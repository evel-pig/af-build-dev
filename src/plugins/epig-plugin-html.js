const { resolve } = require('path');
const fs = require('fs');
const merge = require('lodash/merge');
const isPlainObject = require('is-plain-object');
const utils = require('../utils');

module.exports = function (pluginApi) {
  pluginApi.register('chainWebpackConfig', ({ args: { webpackConfig }, opts = {} }) => {

    let htmlConfigs;
    if (Array.isArray(opts)) {
      htmlConfigs = opts.map(config => getConfig(config));
    } else if (isPlainObject(opts)) {
      htmlConfigs = [getConfig(opts)];
    } else {
      throw new Error(`epig-plugin-html 配置项参数应为 Array 或 Object 格式`);
    }

    htmlConfigs.forEach((config, index) => {
      webpackConfig
        .plugin(`html-webpack-plugin-${index}`)
        .use(require('html-webpack-plugin'), [config]);
    })
  });
}

function getConfig(config) {
  let template;
  if (fs.existsSync(resolve(utils.paths.publicPath, 'index.html'))) {
    template = resolve(utils.paths.publicPath, 'index.html');
  } else if (fs.existsSync(resolve(utils.paths.templatePath, 'index.html'))) {
    template = resolve(utils.paths.templatePath, 'index.html');
  }
  let _opt = {
    inject: true,
    minify: false,
    template: template,
  }
  return merge(_opt, config);
}