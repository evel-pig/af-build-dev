import HtmlWebpackPlugin from 'html-webpack-plugin';

export interface ScriptEnhanceOption {
  area?: 'head' | 'body';
  src?: string;
  content?: string;
  verify?: (opt: any) => boolean;
}

export default class ScriptEnhance {
  opts: ScriptEnhanceOption[];

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
              if (opt.verify) {
                const valid = opt.verify(data.plugin.options);
                if (!valid) {
                  return;
                }
              }
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

                if (!opt.area) {
                  opt.area = 'head';
                }

                if (opt.area === 'head') {
                  data.headTags.push(script);
                } else if (opt.area === 'body') {
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
