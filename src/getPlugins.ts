import chalk from 'chalk';
import assert from 'assert';
import { readdirSync } from 'fs';
import { resolve } from 'path';
import { paths } from './utils';

export interface GetPluginsOpts {
  plugins?: any[];
}

export interface Plugin {
  id: string;
  apply: Function;
  opts: any;
}

// 内置插件
const builtInPlugins = [
  'afwebpack-config',
  // 'epig-plugin-mock',
];

const pluginNames = readdirSync(paths.pluginsPath)
  .filter(name => name.indexOf('.d.ts') < 0)
  .map(name => {
    return name.replace(/\.(ts|js)/, '');
  });

export function getPluginFromPath(pluginName, opts = {}) {
  let plugin;
  if (pluginNames.includes(pluginName)) {
    const pluginPath = resolve(paths.pluginsPath, pluginName);
    const apply = require(pluginPath);
    plugin = {
      id: pluginName,
      apply: apply.default || apply,
      opts: opts,
    };
  } else {
    console.log(`Plugin ${chalk.red(pluginName)} can't be resolved.`);
    console.log(`Exist plugins:\n${pluginNames.join('\n')}\n`);
    process.exit(1);
  }
  return plugin;
}

export default function (opts: GetPluginsOpts = {}) {
  const plugins: Plugin[] = [];

  [
    ...builtInPlugins,
    ...(opts.plugins || []),
  ].forEach(p => {
    assert(
      Array.isArray(p) || typeof p === 'string' || typeof p === 'function',
      `Plugin config should be String or Array or Funtion, but got ${chalk.red(typeof p)}`,
    );

    if (typeof p === 'string' || typeof p === 'function') {
      p = [p];
    }

    const [plugin, opts = {}] = p;

    if (typeof plugin === 'string') {
      const _plugin = getPluginFromPath(plugin, opts);
      if (_plugin) {
        plugins.push(_plugin);
      }
    } else if (typeof plugin === 'function') {
      plugins.push({
        id: `function:${plugin.name || Math.floor(Math.random() * 100000000)}`,
        apply: plugin.default || plugin,
        opts: opts,
      });
    }
  });

  return plugins;
}
