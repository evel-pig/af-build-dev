import { resolve } from 'path';
import isPlainObject from 'is-plain-object';

export const cwd = process.cwd();

export const paths = {
  cwd: cwd,
  pluginsPath: resolve(__dirname, 'plugins'),
  epigPublicPath: resolve(__dirname, '../public'),
  nodeModules: resolve('node_modules'),
  userConfig: resolve('.epigrc.js'),
  mockConfig: resolve('proxy.config.js'),
  publicPath: resolve('public'),
  templatePath: resolve('template'),
  serverPath: resolve('server'),
  tsxEntryPath: resolve('src/index.tsx'),
  jsxEntryPath: resolve('src/index.jsx'),
};

export function immitEntry(entry, pkg = []) {
  if (Array.isArray(entry)) {
    entry = {
      app: entry,
    };
  } else if (typeof entry === 'string') {
    entry = {
      app: [entry],
    };
  }
  let newEntry = {};
  if (isPlainObject(entry)) {
    Object.keys(entry).forEach((name) => {
      newEntry[name] = [
        ...entry[name],
        ...pkg,
      ];
    });
  }
  return newEntry;
}
