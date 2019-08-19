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
  'epig-plugin-mock',
  'epig-plugin-html',
];

const pluginNames = readdirSync(paths.pluginsPath)
  .filter(name => name.indexOf('.d.ts') < 0)
  .map(name => name.replace(/\.(ts|js)/, ''));

export function transformPlugin(plugin: string | Function, opts = {}) {
  let _plugin;
  if (typeof plugin === 'function') {
    _plugin = {
      id: `function:${plugin.name || Math.floor(Math.random() * 100000000)}`,
      apply: plugin,
      opts: opts,
    };
  } else if (pluginNames.includes(plugin)) {
    const pluginPath = resolve(paths.pluginsPath, plugin);
    const apply = require(pluginPath);
    _plugin = {
      id: plugin,
      apply: apply.default || apply,
      opts: opts,
    };
  } else {
    console.log(`Plugin ${chalk.red(plugin)} can't be resolved.`);
    console.log(`Exist plugins:\n${pluginNames.join('\n')}\n`);
    process.exit(1);
  }
  return _plugin;
}

export default function getPlugins(opts: GetPluginsOpts = {}) {
  const plugins: Record<string, Plugin> = {};
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
    const _plugin: Plugin = transformPlugin(plugin, opts);
    if (_plugin) {
      // 删除原插件并且保留新插件顺序;
      if (plugins[_plugin.id]) {
        delete plugins[_plugin.id];
      }
      plugins[_plugin.id] = _plugin;
    }
  });
  return Object.keys(plugins).map((key) => plugins[key]);
}
