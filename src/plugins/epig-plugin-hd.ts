import px2rem from 'postcss-plugin-px2rem';
import isPlainObject from 'is-plain-object';
import { IApi } from '../interface';
import ScriptEnhance, { ScriptEnhanceOption } from '../webpack-plugins/webpack-plugin-script-enhance';

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

  if (!opts.noInject) {

    const enhanceOpts: ScriptEnhanceOption[] = [{
      area: 'head',
      src: 'https://as.alipayobjects.com/g/animajs/anima-hd/5.0.0/vw.js',
    }, {
      area: 'head',
      src: 'https://as.alipayobjects.com/g/component/fastclick/1.0.6/fastclick.js',
    }, {
      area: 'head',
      content: `
    window.vw && window.vw(${opts.px2rem && opts.px2rem.rootValue || 100}, ${opts.psdWidth || 750});
    if ('addEventListener' in document) {
      document.addEventListener('DOMContentLoaded', function() {
        FastClick.attach(document.body);
      }, false);
    }`,
    }];

    api.chainWebpackConfig(({ chainWebpack }) => {
      chainWebpack
        .plugin(`html-hd-enhance`)
        .use(ScriptEnhance, [enhanceOpts]);
    });
  }
}
