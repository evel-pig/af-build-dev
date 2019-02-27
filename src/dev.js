const dev = require('af-webpack/dev').default;
const Service = require('./Service');

module.exports = function () {
  process.env.NODE_ENV = 'development';

  const service = new Service();

  console.log(service.webpackConfig.module.rules)

  dev({
    webpackConfig: service.webpackConfig,
    serverConfig: {
      historyApiFallback: {
        disableDotRule: true,
      },
    },
    _beforeServerWithApp(app) {
      // @private
      service.applyPlugins('beforeServerWithApp', { args: { app } });
    },
  })
}