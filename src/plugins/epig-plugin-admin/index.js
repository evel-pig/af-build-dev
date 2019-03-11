const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const utils = require('../../utils');
const adminEntry = require('./admin-entry');
const adminRoute = require('./admin-route');

module.exports = function (pluginApi) {
  pluginApi.register('register', ({ opts = {} }) => {

    generateTmpFolder();

    if (!opts.noAutoEntry) {
      let entryConfigPath = utils.resolveApp('src/entry.config.ts');
      if (!fs.existsSync(entryConfigPath)) {
        entryConfigPath = utils.resolveApp('src/entry.config.tsx');
        if (!fs.existsSync(entryConfigPath)) {
          throw new Error(`entry config(${entryConfigPath}/.tsx)不存在`);
        }
      }
      adminEntry(pluginApi, opts);
    }

    if (!opts.noAutoRoute) {
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