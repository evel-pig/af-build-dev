import { resolve } from 'path';
import { merge } from 'lodash';
import isPlainObject from 'is-plain-object';
import { paths } from '../utils';
import { IApi } from '../interface';

export default function (api: IApi, opts: any = {}) {

  function getConfig(config) {
    const from = config && config.src && config.src.cwd;
    if (!from) {
      throw new Error(`配置缺失 src.cwd 源文件夹参数`);
    }
    const baseName = from.split('/').pop();
    let _opt = {
      src: {
        glob: '*.{jpg,png}',
      },
      target: {
        image: resolve(paths.cwd, `src/.epig-sprite/${baseName}.png`),
        css: resolve(paths.cwd, `src/.epig-sprite/${baseName}.less`),
      },
      apiOptions: {
        cssImageRef: `${baseName}.png`,
      },
      spritesmithOptions: {
        padding: 5,
      },
    };
    return merge(_opt, config);
  }

  api.chainWebpackConfig(({ chainWebpack }) => {
    chainWebpack.resolve.modules.add(resolve('src/.epig-sprite'));

    let spriteConfigs;
    if (Array.isArray(opts)) {
      spriteConfigs = opts.map(config => getConfig(config));
    } else if (isPlainObject(opts)) {
      spriteConfigs = [getConfig(opts)];
    } else {
      throw new Error(`epig-plugin-sprite 配置项参数应为 Array 或 Object 格式`);
    }

    spriteConfigs.forEach((config, index) => {
      chainWebpack
        .plugin(`webpack-spritesmith-${index}`)
        .use(require('webpack-spritesmith'), [config]);
    });
  });
}
