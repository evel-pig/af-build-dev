const getConfig = require('af-webpack/getConfig').default;
const getUserConfig = require('af-webpack/getUserConfig').default;
const assert = require('assert');

module.exports = function (service) {

  const config = service.config;

  // 读取用户 .webpackrc ;
  const webpackrc = getUserConfig();

  // 合并用户 .webpackrc 以及内建afWebpackOpts
  const afWebpackOpts = service.applyPlugins('modifyAFWebpackOpts', {
    initialValue: {
      cwd: service.cwd,
      ...webpackrc.config,
    },
  });

  // afWebpackOpts(.webpackrc)中不应该有chainConfig配置项;
  assert(
    !('chainConfig' in afWebpackOpts),
    `chainConfig should not supplied in modifyAFWebpackOpts`,
  );

  afWebpackOpts.chainConfig = webpackConfig => {
    // 可通过chainWebpackConfig方式修改用户配置，比modifyWebpackConfig更灵活
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

  // 可对最终的webpack config进行修改;
  return service.applyPlugins('modifyWebpackConfig', {
    initialValue: getConfig(afWebpackOpts),
  });
}
