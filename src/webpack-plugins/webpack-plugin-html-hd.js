const HtmlWebpackPlugin = require('html-webpack-plugin');

class HtmlHD {
  constructor(opts) {
    this.opts = opts || {};
  }

  getScript() {

    const rootValue = this.opts.rootValue || 100;
    const psdWidth = this.opts.psdWidth || 750;

    const script = `
  <script type="text/javascript" src="https://as.alipayobjects.com/g/component/fastclick/1.0.6/fastclick.js"></script>
  <script type="text/javascript" src="https://as.alipayobjects.com/g/animajs/anima-hd/5.0.0/vw.js"></script>
  <script>
    window.vw && window.vw(${rootValue}, ${psdWidth});
    if ('addEventListener' in document) {
      document.addEventListener('DOMContentLoaded', function() {
        FastClick.attach(document.body);
      }, false);
    }
  </script>\n`;

    return script;
  }

  apply(compiler) {

    const titleRegExp = /(<\/title\s*>)/i;
    const headRegExp = /(<\/head\s*>)/i;

    compiler.hooks.compilation.tap('html-hd', (compilation) => {
      // html-webpack-plugin 4
      if (HtmlWebpackPlugin.getHooks) {
        HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
          'html-hd', // <-- Set a meaningful name here for stacktraces
          (data, cb) => {
            // Manipulate the content
            if (titleRegExp.test(data.html)) {
              data.html = data.html.replace(titleRegExp, `</title>${this.getScript()}`)
            } else {
              data.html = data.html.replace(headRegExp, `${this.getScript()}</head>`);
            }
            // Tell webpack to move on
            cb(null, data)
          }
        )
      }
    })
  }
}

module.exports = HtmlHD;