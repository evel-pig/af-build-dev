const isPlainObject = require('is-plain-object');
const path = require('path');
const merge = require('lodash/merge');
const { paths } = require('../utils');

module.exports = function (pluginApi) {
  pluginApi.register('chainWebpackConfig', ({ args: { webpackConfig }, opts = {} }) => {

    let spriteConfigs;

    if (Array.isArray(opts)) {
      spriteConfigs = opts.map(config => getConfig(config));
    } else if (isPlainObject(opts)) {
      spriteConfigs = [getConfig(opts)];
    } else {
      throw new Error(`epig-plugin-sprite 配置项参数应为 Array 或 Object 格式`);
    }

    webpackConfig.resolve.modules.add('epig-sprite');

    spriteConfigs.forEach((config, index) => {
      webpackConfig
        .plugin(`webpack-spritesmith-${index}`)
        .use(require('webpack-spritesmith'), [config]);
    })

  });
}

function getConfig(config) {
  const from = config && config.src && config.src.cwd;
  if (!from) {
    throw new Error(`配置缺失 src.cwd 源文件夹参数`);
  }
  const baseName = from.split('/').pop();
  let _opt = {
    src: {
      glob: '*.png'
    },
    target: {
      image: path.resolve(paths.cwd, `src/epig-sprite/${baseName}.png`),
      css: path.resolve(paths.cwd, `src/epig-sprite/${baseName}.less`)
    },
    apiOptions: {
      cssImageRef: `./${baseName}.png`,
    },
    spritesmithOptions: {
      padding: 5,
    }
  }
  return merge(_opt, config);
}