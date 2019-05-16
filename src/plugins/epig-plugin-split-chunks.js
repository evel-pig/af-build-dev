const isPlainObject = require('is-plain-object');

module.exports = function (pluginApi, options) {
  pluginApi.register('chainWebpackConfig', ({ args: { webpackConfig }, opts = {} }) => {

    const _opts = options || opts;

    const defaultConfig = webpackConfig.optimization.get('splitChunks');

    webpackConfig.optimization.splitChunks({
      ...defaultConfig,
      ..._opts,
      cacheGroups: {
        ...(isPlainObject(defaultConfig.cacheGroups) ? defaultConfig.cacheGroups : {}),
        ...(isPlainObject(_opts.cacheGroups) ? _opts.cacheGroups : {}),
      }
    })
  });
}