import { existsSync } from 'fs';
import { resolve } from 'path';
import { webpackHotDevClientPath } from 'af-webpack/react-dev-utils';
import { IApi } from '../interface';
import { paths, immitEntry } from '../utils';
import Compression from 'compression-webpack-plugin';
import ScriptEnhance from '../webpack-plugins/webpack-plugin-script-enhance';

export default function (api: IApi, opts: any = {}) {
  const isDev = process.env.NODE_ENV === 'development';
  const noPolyfill = process.env.POLYFILL === 'none';

  const { targets = {}, treeShaking, gzip, scripts = [] } = api.service.config;

  api.modifyAFWebpackOpts((memo, args) => {
    return {
      publicPath: '/',
      ignoreMomentLocale: true,
      disableDynamicImport: false,
      hash: isDev ? false : true,
      ...memo,
      urlLoaderExcludes: [
        /\.(html|ejs|txt)$/, // 避免url-loader打包html/ejs/txt文件;
        ...(memo.urlLoaderExcludes || []),
      ],
      extraBabelPresets: [
        [require.resolve('babel-preset-umi'), {
          targets: {
            chrome: 49,
            firefox: 64,
            safari: 10,
            edge: 13,
            ios: 10,
            ...targets,
          },
          env: {
            useBuiltIns: 'entry',
            corejs: 3,
            ...(treeShaking ? { modules: false } : {}),
          },
        }],
        ...(memo.extraBabelPresets || []),
      ],
      extraBabelPlugins: [
        [require.resolve('babel-plugin-import'), { libraryName: 'antd', style: true }, 'antd'],
        [require.resolve('babel-plugin-import'), { libraryName: 'antd-mobile', style: true }, 'antd-mobile'],
        [require.resolve('babel-plugin-import'), {
          libraryName: 'ant-design-pro',
          libraryDirectory: 'lib',
          style: true,
          camel2DashComponentName: false,
        }, 'ant-design-pro'],
        ...(memo.extraBabelPlugins || []),
      ],
    };
  });

  api.chainWebpackConfig(({ chainWebpack }) => {

    if (!isDev && gzip) {
      chainWebpack
        .plugin('gzip')
        .use(Compression, [{
          test: /\.js(\?.*)?$/i,
        }]);
    }

    if (scripts.length > 0) {
      chainWebpack
        .plugin('html-script-enhance')
        .use(ScriptEnhance, [scripts]);
    }

    chainWebpack.resolve.modules.add(resolve('src/styles'));
    // 添加txt文件打包支持
    chainWebpack.module
      .rule('txt')
      .test(/\.txt?$/)
      .use('raw-loader')
      .loader(require.resolve('raw-loader'));
  });

  api.modifyEntry((memo, args) => {
    if (Object.keys(memo).length !== 0) {
      return memo;
    }
    let entryPath;
    if (existsSync(paths.tsxEntryPath)) {
      entryPath = paths.tsxEntryPath;
    } else if (existsSync(paths.jsxEntryPath)) {
      entryPath = paths.jsxEntryPath;
    }
    if (entryPath) {
      return {
        app: [entryPath],
      };
    }
    return memo;
  });

  api.modifyWebpackConfig((memo) => {

    memo.entry = immitEntry(memo.entry, [
      ...(noPolyfill ? [] : resolve(paths.epigPublicPath, 'polyfill.js')),
      ...(isDev ? [webpackHotDevClientPath] : []),
    ]);

    return memo;
  });
}
