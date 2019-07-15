import chokidar from 'chokidar';
import { existsSync, readdirSync, statSync, mkdirSync, writeFileSync } from 'fs';
import { removeSync } from 'fs-extra';
import { join, resolve, isAbsolute } from 'path';
import isPlainObject from 'is-plain-object';
import { IApi } from '../interface';

export default function (api: IApi, opts: any = []) {

  if (isPlainObject(opts)) {
    opts = [opts];
  } else if (!Array.isArray(opts)) {
    throw new Error('epig-plugin-enhance-copy 配置项参数应为 Array 或 Object 格式');
  }

  api.modifyAFWebpackOpts((memo, args) => {
    const copy = opts.map(config => {
      const { mapOutput, disableMap, ...rest } = config;

      // 清除输出目录;
      const tmpOutputPath = mapOutput ? resolve(mapOutput) : resolve('src/.assets-map');

      if (existsSync(tmpOutputPath)) {
        removeSync(tmpOutputPath);
      }

      return rest;
    });

    memo.copy = copy;

    opts.forEach(config => {
      if (!config.disableMap) {
        buildMap(config, memo.publicPath);
      }
    });

    return memo;
  });
}

function buildMap(config, publicPath) {

  const isAbsolutePath = isAbsolute(config.from);
  let sourcePath;
  if (isAbsolutePath) {
    sourcePath = config.from;
  } else {
    sourcePath = resolve(config.from);
  }

  function generaterFileMap() {
    // 获取文件列表
    function getFileList(filePath) {
      const map = {};
      // 根据文件路径读取文件，返回文件列表
      const files = readdirSync(filePath);
      files.forEach((filename) => {
        // 获取当前文件的绝对路径
        const filedir = join(filePath, filename);
        const stats = statSync(filedir);
        const isDir = stats.isDirectory();
        // 递归，如果是文件夹，就继续遍历该文件夹下面的文件
        if (isDir) {
          map[filename] = getFileList(filedir);
        }
        // 判断是否文件
        const isFile = stats.isFile();
        if (isFile) {
          const targetPath = filedir.replace(sourcePath, publicPath + (config.to || ''));
          // 使用文件名字作为key;
          const key = filename.split('.')[0];
          if (key) {
            map[key] = targetPath.replace('\/\/', '\/'); // 修正路径
          }
        }
      });
      return map;
    }

    const filesMap = getFileList(sourcePath);

    // 用配置项中的文件目录作为文件名
    const fileName = config.from.split('/').pop();

    const tmpOutputPath = config.mapOutput ? resolve(config.mapOutput) : resolve('src/.assets-map');

    if (!existsSync(tmpOutputPath)) {
      mkdirSync(tmpOutputPath);
    }

    const filePath = resolve(tmpOutputPath, `${fileName}.ts`);

    // 删除文件
    if (existsSync(filePath)) {
      removeSync(filePath);
    }

    let tpl = `/* tslint:disable */\nexport default <%= map %>;\n`;

    tpl = tpl.replace('<%= map %>', JSON.stringify(filesMap, null, 2)).replace(/\"/g, '\'');

    // 写入文件
    writeFileSync(filePath, tpl, { encoding: 'utf-8' });
  }

  const dev = process.env.NODE_ENV === 'development';

  if (dev) {
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
  } else {
    generaterFileMap();
  }
}
