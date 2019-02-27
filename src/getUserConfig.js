const fs = require('fs');
const { paths } = require('./utils');

/*
* 获取`.afrc.js`配置文件
*/
module.exports = function () {
  let config = {};
  const rcPath = paths.userConfig;

  if (fs.existsSync(rcPath)) {
    delete require.cache[rcPath];
    config = require(rcPath); // eslint-disable-line
    if (config.default) {
      config = config.default;
    }
  }

  return config;
};
