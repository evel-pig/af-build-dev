import { resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { removeSync } from 'fs-extra';
import isPlainObject from 'is-plain-object';
import { IApi } from '../../interface';
import { getPluginByName } from '../../getPlugins';
import adminEntry from './admin-entry';
import adminRoute from './admin-route';

export default function (api: IApi, opts: any = {}) {

  function generateTmpFolder() {
    // 创建临时文件夹(adminTmpPath)
    const tmpFolderPath = resolve('src/.admin-tools');
    if (existsSync(tmpFolderPath)) {
      removeSync(tmpFolderPath);
    }
    mkdirSync(tmpFolderPath);
  }

  if (!(opts.noAutoEntry && opts.noAutoRoute)) {
    generateTmpFolder();
  }

  if (!opts.noAutoEntry) {
    adminEntry(api, opts);
  }

  if (!opts.noAutoRoute) {
    adminRoute(api, opts);
  }

  if (!opts.noSplitChunks) {
    api.registerPlugin(getPluginByName('epig-plugin-split-chunks', {
      cacheGroups: {
        // 抽离node_modules中非admin-tools的模块
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
        ...(isPlainObject(opts.cacheGroups) ? opts.cacheGroups : {}),
      },
    }));
  }
}
