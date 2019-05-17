const px2rem = require('postcss-plugin-px2rem');

module.exports = function (pluginApi) {
  pluginApi.register('modifyAFWebpackOpts', ({ memo, opts = {} }) => {

    memo.theme = {
      '@hd': '2px',
      ...(memo.theme || {}),
      ...(opts.theme || {}),
    };

    memo.extraPostCSSPlugins = [
      ...(memo.extraPostCSSPlugins || []),
      px2rem({
        rootValue: 100,
        minPixelValue: 2,
        ...(opts.px2rem || {}),
      }),
    ];

    return memo;
  });

  pluginApi.register('chainWebpackConfig', ({ args: { webpackConfig }, opts = {} }) => {

    if (opts.inject) {
      webpackConfig
        .plugin(`html-hd`)
        .use(require('../webpack-plugins/webpack-plugin-html-hd'), [{
          rootValue: opts.px2rem && opts.px2rem.rootValue || 100,
          psdWidth: opts.psdWidth,
        }]);
    }
  });
}
