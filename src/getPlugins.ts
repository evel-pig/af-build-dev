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
  'test',
  'afwebpack-config',
  // 'epig-plugin-mock',
];

const pluginNames = readdirSync(paths.pluginsPath).map(name => {
  return name.replace(/\.(ts|js)/, '');
});

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
      if (pluginNames.includes(plugin)) {
        const pluginPath = resolve(paths.pluginsPath, p[0]);
        const apply = require(pluginPath);
        plugins.push({
          id: plugin,
          apply: apply.default || apply,
          opts: opts,
        });
      } else {
        console.log(`Plugin ${chalk.red(plugin)} can't be resolved.`);
        console.log(`Exist plugins:\n${pluginNames.join('\n')}\n`);
        process.exit(1);
      }
    } else if (typeof plugin === 'function') {
      plugins.push({
        id: plugin.name || `epigrc:${Math.floor(Math.random() * 100000000)}`,
        apply: plugin,
        opts: opts,
      });
    }
  });

  return plugins;
}
