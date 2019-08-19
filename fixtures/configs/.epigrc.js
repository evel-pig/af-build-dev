const path = require('path');

module.exports = {
  entry: {
    test: [path.resolve(__dirname, 'src/index.js')],
  },
  targets: {
    ie: 11
  },
  gzip: true,
}