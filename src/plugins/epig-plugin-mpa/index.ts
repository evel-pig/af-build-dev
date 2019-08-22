import { resolve } from 'path';
import { transformPlugin } from '../../getPlugins';
import { IApi } from '../../interface';

export default function (api: IApi, opts: any[] = []) {

  function getConfig() {
    const entrys = {};
    const htmlConfig = [];

    opts.forEach(page => {
      const { htmlName, entry, ...rest } = page;

      const entryName = entry.split('/').slice(-2)[0];
      entrys[entryName] = [resolve(entry)];

      const mode = rest.mode || 'wap';
      if (mode !== 'wap' && mode !== 'pc') {
        throw new Error(`epig-plugin-mpa 配置项 mode 参数应为 'wap' 或者 'pc'`);
      }

      htmlConfig.push({
        chunks: ['vendors', 'commons', entryName],
        mode: 'wap',
        filename: `${htmlName || entryName}.html`,
        template: resolve(__dirname, `template/mpa-${mode}.ejs`),
        px2remRootValue: 100,
        psdWidth: 750,
        ...rest,
      });
    });
    return { entrys, htmlConfig };
  }

  if (Array.isArray(opts) && opts.length > 0) {

    const { entrys, htmlConfig } = getConfig();

    api.modifyEntry((memo, args) => {
      return entrys;
    });

    api.registerPlugin(transformPlugin('epig-plugin-html', htmlConfig));

    api.registerPlugin(transformPlugin('epig-plugin-hd', { noInject: true }));

    if (opts.length > 1) {
      api.registerPlugin(transformPlugin('epig-plugin-split-chunks', {
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          commons: {
            name: 'commons',
            chunks: 'async',
            minChunks: 2,
          },
        },
      }));
    }
  } else {
    throw new Error(`epig-plugin-mpa 配置项参数应为 Array 格式`);
  }
}
