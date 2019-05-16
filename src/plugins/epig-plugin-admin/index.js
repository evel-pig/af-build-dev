const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const utils = require('../../utils');
const adminEntry = require('./admin-entry');
const adminRoute = require('./admin-route');
const splitChunks = require('../epig-plugin-split-chunks');
const isPlainObject = require('is-plain-object');

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

    if (!opts.noSplitChunks) {
      splitChunks(pluginApi, {
        cacheGroups: {
          // 抽离admin-tools
          vendor: {
            test: /[\\/]node_modules[\\/](?!@epig\/admin-tools)/,
            name: 'vendor',
            chunks: 'all',
          },
          // 抽离antd && rc-*
          antd: {
            test: /(@ant-design|antd|rc-)/,
            name: 'antd',
            chunks: 'all',
            enforce: true,
            priority: 2,
          },
          wangEditor: {
            test: /wangEditor/,
            name: 'wangEditor',
            chunks: 'async',
            priority: 3,
            enforce: true,
          },
          commons: {
            name: 'commons',
            chunks: 'async',
            minChunks: 2,
            enforce: true,
            priority: 1,
          },
        },
        ...(isPlainObject(opts.cacheGroups) ? opts.cacheGroups : {}),
      });
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