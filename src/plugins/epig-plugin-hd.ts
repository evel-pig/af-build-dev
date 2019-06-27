import px2rem from 'postcss-plugin-px2rem';
import isPlainObject from 'is-plain-object';
import { IApi } from '../interface';
import HtmlHd from '../webpack-plugins/webpack-plugin-html-hd';

export default function (api: IApi, opts: any = {}) {
  api.modifyAFWebpackOpts((memo, args) => {
    memo.theme = {
      '@hd': '2px',
      ...(isPlainObject(memo.theme) ? memo.theme as any : {}),
      ...(isPlainObject(opts.theme) ? opts.theme : {}),
    };

    memo.extraPostCSSPlugins = [
      ...(memo.extraPostCSSPlugins || []),
      px2rem({
        rootValue: 100,
        minPixelValue: 2,
        ...(opts.px2rem || {}),
      }),
    ];

    return memo;
  });

  if (opts.inject) {
    api.chainWebpackConfig(({ chainWebpack }) => {
      chainWebpack
        .plugin(`html-hd`)
        .use(HtmlHd, [{
          rootValue: opts.px2rem && opts.px2rem.rootValue || 100,
          psdWidth: opts.psdWidth || 750,
        }]);
    });
  }
}
