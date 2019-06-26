import build from 'af-webpack/build';
import Service from '../Service';

export default function () {
  process.env.NODE_ENV = 'production';

  const service = new Service();

  service.init();

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
  });
}
