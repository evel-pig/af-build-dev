const fse = require('fs-extra');
const chalk = require('chalk');
const utils = require('../utils');

module.exports = function (pluginApi) {
  pluginApi.register('onBuildSuccess', ({ args: { stats }, opts = {} }) => {

    if (fse.pathExistsSync(utils.paths.serverPath)) {
      const webpackConfig = pluginApi.service.webpackConfig;
      let distPath;
      if (opts.output) {
        distPath = utils.resolveApp(opts.output);
      } else {
        distPath = webpackConfig.output.path;
      }

      fse.copy(utils.paths.serverPath, distPath, {
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