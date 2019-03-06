const chokidar = require('chokidar');
const fs = require('fs');
const fse = require('fs-extra');
const { join, resolve, isAbsolute } = require('path');
const { resolveApp } = require('../utils');

module.exports = function (pluginApi) {
  pluginApi.register('modifyAFWebpackOpts', ({ memo, opts = [] }) => {

    const copy = opts.map(config => {
      const { mapTo, disableMap, ...rest } = config;
      return rest;
    })

    memo.copy = copy;

    opts.forEach(config => {
      if (!disableMap) {
        watch(config, memo.publicPath);
      }
    });

    return memo;
  });
}

function watch(config, publicPath) {

  const isAbsolutePath = isAbsolute(config.from);
  let sourcePath;
  if (isAbsolutePath) {
    sourcePath = config.from;
  } else {
    sourcePath = resolveApp(config.from);
  }

  function generaterFileMap() {

    // 获取文件列表
    function getFileList(filePath) {
      const map = {};
      // 根据文件路径读取文件，返回文件列表
      const files = fs.readdirSync(filePath);
      files.forEach((filename) => {
        // 获取当前文件的绝对路径
        const filedir = join(filePath, filename);
        const stats = fs.statSync(filedir);
        const isDir = stats.isDirectory();
        // 递归，如果是文件夹，就继续遍历该文件夹下面的文件
        if (isDir) {
          map[filename] = getFileList(filedir);
        }
        // 判断是否文件
        const isFile = stats.isFile();
        if (isFile) {
          const targetPath = filedir.replace(sourcePath, publicPath + config.to);
          // 使用文件名字作为key;
          const key = filename.split('.')[0];
          map[key] = targetPath;
        }
      });
      return map;
    }

    const filesMap = getFileList(sourcePath);

    // 用配置项中的文件目录作为文件名
    const fileName = config.from.split('/').pop();

    const tmpOutputPath = config.mapTo ? resolveApp(config.mapTo) : resolveApp('src/.copy-map');

    if (!fs.existsSync(tmpOutputPath)) {
      fs.mkdirSync(tmpOutputPath);
    }

    const filePath = resolve(tmpOutputPath, `${fileName}.ts`);

    if (fs.existsSync(filePath)) {
      fse.removeSync(filePath);
    }

    let tpl = `/* tslint:disable */\nexport default <%= map %>;\n`;

    tpl = tpl.replace('<%= map %>', JSON.stringify(filesMap, null, 2)).replace(/\"/g, '\'');

    // 写入文件
    fs.writeFileSync(filePath, tpl, { encoding: 'utf-8' });
  }

  // 监听copy的文件夹;
  const watcher = chokidar.watch(sourcePath);
  watcher.on('change', () => {
    generaterFileMap();
  });
  watcher.on('add', () => {
    generaterFileMap();
  });
  watcher.on('unlink', () => {
    generaterFileMap();
  });
  process.on('SIGINT', () => {
    watcher.close();
  });
}