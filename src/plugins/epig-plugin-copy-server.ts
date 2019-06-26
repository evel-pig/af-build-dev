import chalk from 'chalk';
import { resolve } from 'path';
import { pathExistsSync, copy } from 'fs-extra';
import { paths } from '../utils';
import { IApi } from '../interface';

export default function (api: IApi, opts: any = {}) {
  api.onBuildSuccess(() => {
    if (pathExistsSync(paths.serverPath)) {
      const webpackConfig = api.service.webpackConfig;
      let distPath;
      if (opts.output) {
        distPath = resolve(opts.output);
      } else {
        distPath = webpackConfig.output.path;
      }

      copy(paths.serverPath, distPath, {
        filter: (src) => {
          const skip = src.includes('node_modules');
          return !skip;
        },
      }).then(() => {
        console.log('');
        console.log(chalk.green(`拷贝server文件夹到${distPath}成功`));
        console.log('');
      });
    }
  });
}
