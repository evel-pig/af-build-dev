const fs = require('fs');
const { resolve } = require('path');
const { paths } = require('./utils');

// 内置插件
const builtInPlugins = [
  'mock',
  'afwebpack-config',
];

const pluginNames = fs.readdirSync(paths.pluginsPath).map(name =>
  name.replace(/\.js/, '')
);

module.exports = function (config = {}) {

  const { plugins = [] } = config;

  const mergePlugins = [
    ...builtInPlugins,
    ...plugins,
  ];

  const pluginsObj = [];

  mergePlugins.forEach(p => {
    let opts;
    if (Array.isArray(p)) {
      opts = p[1]; // eslint-disable-line
      p = p[0];
    }

    if (pluginNames.includes(p)) {
      const pluginPath = resolve(paths.pluginsPath, p);
      const apply = require(pluginPath); // eslint-disable-line

      pluginsObj.push({
        id: p,
        apply: apply.default || apply,
        opts: opts,
      })
    } else {
      console.log(`插件${p}不在插件列表(${pluginNames})中`)
    }
  })

  return pluginsObj;
}