import { resolve } from 'path';
import { existsSync } from 'fs';
import { merge } from 'lodash';
import isPlainObject from 'is-plain-object';
import { paths } from '../utils';
import { IApi } from '../interface';

export default function (api: IApi, opts: any = {}) {

  function getConfig(config = {}) {
    let template;
    // template的查找顺序,public/index.html --> template/index.html --> af-build-dev/public/index.html
    if (existsSync(resolve(paths.publicPath, 'index.html'))) {
      template = resolve(paths.publicPath, 'index.html');
    } else if (existsSync(resolve(paths.templatePath, 'index.html'))) {
      template = resolve(paths.templatePath, 'index.html');
    } else {
      template = resolve(paths.epigPublicPath, 'index.html');
    }
    let _opt = {
      inject: true,
      minify: false,
      template: template,
    };
    return merge(_opt, config);
  }

  api.chainWebpackConfig(({ chainWebpack }) => {
    let htmlConfigs;
    if (Array.isArray(opts)) {
      htmlConfigs = opts.map(config => getConfig(config));
    } else if (isPlainObject(opts)) {
      htmlConfigs = [getConfig(opts)];
    } else {
      throw new Error(`epig-plugin-html 配置项参数应为 Array 或 Object 格式`);
    }

    htmlConfigs.forEach((config, index) => {
      chainWebpack
        .plugin(`html-webpack-plugin-${index}`)
        .use(require('html-webpack-plugin'), [config]);
    });
  });
}
