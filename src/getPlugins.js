const fs = require('fs');
const chalk = require('chalk');
const { resolve } = require('path');
const { paths } = require('./utils');

// 内置插件
const builtInPlugins = [
  'afwebpack-config',
  'epig-plugin-html',
  'epig-plugin-mock',
  'epig-plugin-copy-server',
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

    if (typeof p === 'string') {
      if (pluginNames.includes(p)) {
        const pluginPath = resolve(paths.pluginsPath, p);
        const apply = require(pluginPath); // eslint-disable-line
        pluginsObj.push({
          id: p,
          apply: apply.default || apply,
          opts: opts,
        })
      } else {
        console.log(`插件${chalk.red(p)}不在以下插件列表中\n${pluginNames.join('\n')}\n`)
      }
    } else if (typeof p === 'function') {
      pluginsObj.push({
        id: p.name || Math.floor(Math.random() * 100000000),
        apply: p,
        opts: opts,
      })
    }
  })

  return pluginsObj;
}