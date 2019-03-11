const path = require('path');
const fs = require('fs');
const utils = require('../../utils');
const { webpackHotDevClientPath } = require('af-webpack/react-dev-utils');

module.exports = function (pluginApi, opts) {
  generateEntry();

  const isDev = process.env.NODE_ENV === 'development';

  pluginApi.register('modifyAFWebpackOpts', ({ memo }) => {
    memo.entry = {
      app: isDev ? [
        path.resolve(utils.paths.adminTmpPath, 'entry.tsx'),
        '@babel/polyfill',
        webpackHotDevClientPath,
      ] : [path.resolve(utils.paths.adminTmpPath, 'entry.tsx'), '@babel/polyfill'],
    };
    return memo;
  });
}

function generateEntry() {
  const tmpFolderPath = utils.paths.adminTmpPath;

  const routeTplPath = path.resolve(__dirname, './template/entry.js.tpl');
  const tplContent = fs.readFileSync(routeTplPath, 'utf-8');

  const entryPath = path.resolve(tmpFolderPath, 'entry.tsx');

  fs.writeFileSync(entryPath, tplContent, { encoding: 'utf-8' });
}