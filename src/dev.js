const dev = require('af-webpack/dev').default;
const Service = require('./Service');

module.exports = function () {
  process.env.NODE_ENV = 'development';

  const service = new Service();

  let server = null;

  service.applyPlugins('onStart');

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
    beforeServer(devServer) {
      server = devServer;
      service.applyPlugins('beforeDevServer', {
        args: { app: devServer },
      });
    },
    afterServer(devServer) {
      service.applyPlugins('afterDevServer', {
        args: { app: devServer },
      });
    },
    onCompileDone({ isFirstCompile, stats }) {
      service.applyPlugins('onDevCompileDone', {
        args: {
          stats,
        },
      });
    },
  })
}