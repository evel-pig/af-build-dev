const fs = require('fs');
const { paths } = require('./utils');

/*
* 获取`.epig.js`配置文件
*/
module.exports = function (opts = {}) {
  let config = {};
  const rcPath = opts.rcPath || paths.userConfig;

  if (fs.existsSync(rcPath)) {
    delete require.cache[rcPath];
    config = require(rcPath); // eslint-disable-line
    if (config.default) {
      config = config.default;
    }
  }

  return config;
};
