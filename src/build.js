const build = require('af-webpack/build').default;
const Service = require('./Service');

module.exports = function () {
  process.env.NODE_ENV = 'production';

  const service = new Service();

  build({
    webpackConfig: service.webpackConfig,
    onSuccess({ stats }) {
      service.applyPlugins('onBuildSuccess', {
        args: {
          stats,
        },
      });
    },
    onFail({ err, stats }) {
      service.applyPlugins('onBuildFail', {
        args: {
          err,
          stats,
        },
      });
    },
  })
}