import dev from 'af-webpack/dev';
import Service from '../Service';
import fs from 'fs';
import path from 'path';

export default function () {
  process.env.NODE_ENV = 'development';

  const service = new Service();

  service.init();

  service.applyPlugins('onStart');

  console.log('service:', service.plugins);
  console.log('service:', service.pluginHooks);
  console.log('service:', service.pluginMethods);

  dev({
    webpackConfig: service.webpackConfig,
    serverConfig: {
      historyApiFallback: {
        disableDotRule: true,
      },
    },
    _beforeServerWithApp(app) {
      // @private
      service.applyPlugins('beforeServerWithApp', {
        args: { app },
      });
    },
    beforeServer(devServer) {
      service.applyPlugins('beforeDevServer', {
        args: { devServer },
      });
    },
    afterServer(devServer) {
      service.applyPlugins('afterDevServer', {
        args: { devServer },
      });
    },
    onCompileDone({ isFirstCompile, stats }) {
      service.applyPlugins('onDevCompileDone', {
        args: { stats },
      });
    },
  });
}
