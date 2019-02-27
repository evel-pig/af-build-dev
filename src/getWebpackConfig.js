const getConfig = require('af-webpack/getConfig').default;
const getUserConfig = require('af-webpack/getUserConfig').default;
const assert = require('assert');

module.exports = function (service) {
  // 读取用户'.webpackrc.js'配置
  const afWebpackOptions = getUserConfig();

  const isDev = process.env.NODE_ENV === 'development';

  // 获取webpack配置;
  const webpackConfig = getConfig({
    cwd: service.cwd,
    disableDynamicImport: true,
    urlLoaderExcludes: [/\.html$/],
    hash: isDev ? false : true,
    extraBabelPlugins: [
      [require.resolve('babel-plugin-import'), { libraryName: 'antd', style: true }],
      [require.resolve('babel-plugin-import'), { libraryName: 'antd-mobile', style: true }, 'antd-mobile'],
    ],
    ...afWebpackOptions.config,
  });

  return service.applyPlugins('modifyWebpackConfig', {
    initialValue: webpackConfig,
  });
}
