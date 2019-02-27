const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const utils = require('../../utils');
const adminEntry = require('./admin-entry');
const adminRoute = require('./admin-route');

module.exports = function (pluginApi) {
  const entryConfigPath = utils.resolveApp('src/entry.config.ts');
  pluginApi.register('afterInitPlugins', ({ opts = {} }) => {

    if (!fs.existsSync(entryConfigPath)) {
      throw new Error(`entry config(${entryConfigPath})不存在`);
    }

    generateTmpFolder();

    if (opts.entry !== false) {
      adminEntry(pluginApi, opts);
    }

    if (opts.route !== false) {
      adminRoute(pluginApi, opts);
    }
  });
};


function generateTmpFolder() {
  // 创建临时文件夹(adminTmpPath)
  const tmpFolderPath = utils.paths.adminTmpPath;
  if (fs.existsSync(tmpFolderPath)) {
    fse.removeSync(tmpFolderPath);
  }
  fs.mkdirSync(tmpFolderPath);
};