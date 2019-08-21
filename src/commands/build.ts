import build from 'af-webpack/build';
import yParser from 'yargs-parser';
import Service from '../Service';
import { buildDevOpts } from '../utils';

process.env.NODE_ENV = 'production';

const args = yParser(process.argv.slice(2));

const service = new Service(buildDevOpts(args));

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
