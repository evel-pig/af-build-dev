import HtmlWebpackPlugin from 'html-webpack-plugin';

export interface JSEnhanceOption {
  mode: 'head' | 'body';
  src?: string;
  content?: string;
}

export default class JSEnhance {
  opts: JSEnhanceOption[];

  constructor(opts) {
    this.opts = opts || [];
  }

  apply(compiler) {

    compiler.hooks.compilation.tap('epig-html-enhance', (compilation) => {
      // html-webpack-plugin 4
      if (HtmlWebpackPlugin.getHooks) {
        HtmlWebpackPlugin.getHooks(compilation).alterAssetTagGroups.tapAsync(
          'epig-html-enhance', // <-- Set a meaningful name here for stacktraces
          (data, cb) => {

            this.opts.forEach(opt => {
              if (opt.src || opt.content) {
                const script = {
                  tagName: 'script',
                  attributes: {
                    type: 'text/javascript',
                  },
                };

                if (opt.src) {
                  script.attributes['src'] = opt.src;
                } else if (opt.content) {
                  script['innerHTML'] = opt.content;
                }

                if (opt.mode === 'head') {
                  data.headTags.push(script);
                } else if (opt.mode === 'body') {
                  data.bodyTags.push(script);
                }
              }
            });

            // Tell webpack to move on
            cb(null, data);
          },
        );
      }
    });
  }
}
