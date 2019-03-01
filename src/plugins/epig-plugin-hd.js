const px2rem = require('postcss-plugin-px2rem');

module.exports = function (pluginApi) {
  pluginApi.register('modifyAFWebpackOpts', ({ memo, opts = {} }) => {

    memo.theme = {
      ...(memo.theme || {}),
      '@hd': '2px',
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
}