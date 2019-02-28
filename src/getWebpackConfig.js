const getConfig = require('af-webpack/getConfig').default;
const getUserConfig = require('af-webpack/getUserConfig').default;
const assert = require('assert');

module.exports = function (service) {

  const config = service.config;

  // 通过af-buildd-dev内建.webpackrc.js的配置项，不再通过读取配置文件获取
  const afWebpackOpts = service.applyPlugins('modifyAFWebpackOpts', {
    initialValue: {
      cwd: service.cwd,
    },
  });

  assert(
    !('chainConfig' in afWebpackOpts),
    `chainConfig should not supplied in modifyAFWebpackOpts`,
  );

  afWebpackOpts.chainConfig = webpackConfig => {
    service.applyPlugins('chainWebpackConfig', {
      args: {
        webpackConfig: webpackConfig,
      },
    });

    // 可通过 .epigrc 中的chainWebpack 配置项配置webpackConfig
    if (config.chainWebpack) {
      config.chainWebpack(webpackConfig, {
        webpack: require('af-webpack/webpack'),
      });
    }

  };

  return service.applyPlugins('modifyWebpackConfig', {
    initialValue: getConfig(afWebpackOpts),
  });
}
