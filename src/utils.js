const { resolve } = require('path');

const cwd = process.cwd();

exports.resolveApp = relativePath => resolve(cwd, relativePath);

exports.paths = {
  cwd: cwd,
  pluginsPath: resolve(__dirname, 'plugins'),
  absNodeModules: resolve('node_modules'),
  userConfig: resolve('.epigrc.js'),
  mockConfig: resolve('proxy.config.js'),
  adminTmpPath: resolve('src/.admin-tools'),
  publicPath: resolve('public'),
  templatePath: resolve('template'),
  serverPath: resolve('server'),
};

exports.insertEntry = (entry, others = []) => {
  let newEntry = [...others];
  if (entry) {
    if (Array.isArray(entry)) {
      // array格式，合并
      entry = newEntry.concat(entry);
    } else if (typeof entry === 'string') {
      // string格式，合并
      newEntry.push(entry);
    } else if (typeof entry === 'object') {
      // object格式,给entry添加others
      const _entry = {};
      Object.keys(entry).forEach((name) => {
        if (typeof entry[name] === 'string') {
          _entry[name] = [...others, entry[name]];
        } else if (Array.isArray(entry[name])) {
          _entry[name] = [...others, ...entry[name]];
        }
      });
      newEntry = _entry;
    }
  }
  return newEntry;
};