import dev from 'af-webpack/dev';
import Service from '../Service';

let closed = false;

// kill(2) Ctrl-C
process.once('SIGINT', () => onSignal('SIGINT'));
// kill(3) Ctrl-\
process.once('SIGQUIT', () => onSignal('SIGQUIT'));
// kill(15) default
process.once('SIGTERM', () => onSignal('SIGTERM'));

function onSignal(type?) {
  if (closed) {
    return;
  }
  closed = true;
  process.exit(0);
}

process.env.NODE_ENV = 'development';

const service = new Service();

service.init();

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
