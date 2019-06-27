import isPlainObject from 'is-plain-object';
import { IApi } from '../interface';

export default function (api: IApi, opts: any = {}) {
  api.chainWebpackConfig(({ chainWebpack }) => {

    const defaultConfig = chainWebpack.optimization.get('splitChunks');

    chainWebpack.optimization.splitChunks({
      ...defaultConfig,
      ...opts,
      cacheGroups: {
        ...(isPlainObject(defaultConfig.cacheGroups) ? defaultConfig.cacheGroups : {}),
        ...(isPlainObject(opts.cacheGroups) ? opts.cacheGroups : {}),
      },
    });
  });
}
