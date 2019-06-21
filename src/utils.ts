import { resolve } from 'path';

export const cwd = process.cwd();

export const paths = {
  cwd: cwd,
  pluginsPath: resolve(__dirname, 'plugins'),
  nodeModules: resolve('node_modules'),
  userConfig: resolve('.epigrc.js'),
  mockConfig: resolve('proxy.config.js'),
  publicPath: resolve('public'),
  templatePath: resolve('template'),
  serverPath: resolve('server'),
};
