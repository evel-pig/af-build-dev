import chalk from 'chalk';
import { resolve } from 'path';
import { pathExistsSync, copy } from 'fs-extra';
import { paths } from '../utils';
import { IApi } from '../interface';

export default function (api: IApi, opts: any = {}) {
  if (pathExistsSync(paths.serverPath)) {

    api.modifyAFWebpackOpts((memo, args) => {
      if (!memo.outputPath) {
        memo.outputPath = 'dist/static';
      }
      return memo;
    });

    api.onBuildSuccess(() => {
      let distPath;
      if (opts.output) {
        distPath = resolve(paths.cwd, opts.output);
      } else {
        distPath = resolve(paths.cwd, 'dist');
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
    });
  }
}
