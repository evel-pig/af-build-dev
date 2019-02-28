const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');
const utils = require('../../utils');
const launchRouterPoint = require('./launchRouterPoint');

const loadUrls = [];

module.exports = function (pluginApi, opts) {
  const containersPath = utils.resolveApp('src/containers');

  const { async, noAutoModel } = opts;

  pluginApi.register('modifyAFWebpackOpts', ({ memo }) => {
    const dev = process.env.NODE_ENV === 'development';

    if (dev && async) {
      memo.entry = utils.insertEntry(memo.entry, [require.resolve('./webpackAsyncRouterDevClient')]);
    }

    startGenerateRoutes(containersPath, dev && async, noAutoModel);

    if (dev && !async) {
      watch(containersPath, noAutoModel);
    }

    return memo;
  });

  pluginApi.register('beforeDevServer', ({ args: { app, noAutoModel } }) => {
    app.use((req, res, next) => {
      if (req.url.startsWith(launchRouterPoint)) {
        if (loadUrls.indexOf(req.query.url) < 0) {
          loadUrls.push(req.query.url);
          startGenerateRoutes(containersPath, true, noAutoModel);
        }
        res.end();
      } else {
        next();
      }
    });
  });
};

function startGenerateRoutes(containersPath, dev, noModel) {
  const routes = getRouterInfo(containersPath, dev, noModel);
  generateRoutes(routes);
}

function watch(targetPath, noAutoModel) {
  //  监听containers文件夹，有修改时重新生成router
  const watcher = chokidar.watch(targetPath);
  watcher.on('change', () => {
    startGenerateRoutes(targetPath, false, noAutoModel);
  });
  watcher.on('add', () => {
    startGenerateRoutes(targetPath, false, noAutoModel);
  });
  watcher.on('unlink', () => {
    startGenerateRoutes(targetPath, false, noAutoModel);
  });
  process.on('SIGINT', () => {
    watcher.close();
  });
}

function generateRoutes(routes) {
  // 价值route模板文件
  const routeTplPath = path.resolve(__dirname, './template/router.js.tpl');
  let tplContent = fs.readFileSync(routeTplPath, 'utf-8');
  tplContent = tplContent.replace('<%= routes %>', () => routes);

  const tmpFolderPath = utils.paths.adminTmpPath;

  const routerPath = path.resolve(tmpFolderPath, 'router.ts');
  fs.writeFileSync(routerPath, tplContent, { encoding: 'utf-8' });
}

function generateImport(chunkName, path) {
  return `() => import (/* webpackChunkName: ^${chunkName}^ */\r\n      '${path}')`;
}

function getRouterInfo(containersPath, dev, noModel) {
  const routerInfos = [];
  let chunkFolders = [];
  if (fs.existsSync(containersPath)) {
    chunkFolders = fs.readdirSync(containersPath);
  }
  const globalModels = getGlobalModels(utils.resolveApp('src/models'));
  chunkFolders.forEach(chunkFolder => {
    const folderPath = path.resolve(containersPath, chunkFolder);
    const containers = fs.readdirSync(folderPath);
    const chunkName = lowerFirstCase(chunkFolder);
    const isIndex = fs.existsSync(path.resolve(folderPath, 'index.tsx'));
    let currentGlobalModels = [...globalModels];
    currentGlobalModels = currentGlobalModels.concat(getModels(chunkName, folderPath));
    containers.forEach(container => {
      // 排除临时文件
      if (container === '.DS_Store') {
        return;
      }
      // 如果是models文件夹，跳过
      if (container === 'models') {
        return;
      }
      let components = {};
      let models = {};
      let routerPath = '';
      const containerPath = path.resolve(folderPath, container);
      // 一级菜单
      if (container === 'index.tsx') {
        const indexInfo = loadContainer(chunkFolder, chunkName, currentGlobalModels, folderPath
          , 'index', folderPath);
        components = {
          ...components,
          ...indexInfo.components,
        };
        if (!noModel) {
          models = {
            ...models,
            ...indexInfo.models,
          };
        }

        routerPath = `/${chunkName}`;
      }
      const stat = fs.lstatSync(containerPath);
      if (!stat.isDirectory() && !isIndex) {
        return;
      }

      if (!isIndex) {
        const containerInfo = loadContainer(container, chunkName, currentGlobalModels, folderPath
          , container, containerPath);
        components = {
          ...components,
          ...containerInfo.components,
        };
        if (!noModel) {
          models = {
            ...models,
            ...containerInfo.models,
          };
        }
        routerPath = `/${chunkName}/${lowerFirstCase(container)}`;
      }

      if ((loadUrls.indexOf(routerPath) >= 0 || !dev) && Object.keys(components).length > 0) {
        let routerInfo = {
          path: routerPath,
          components,
        };
        if (Object.keys(models).length > 0) {
          routerInfo = {
            ...routerInfo,
            models,
          };
        }
        routerInfos.push(routerInfo);
      }
    });
  });

  let routes = JSON.stringify(routerInfos, null, 2);
  function stripRouteQuote(routesStr) {
    routesStr = routesStr
      .replace(/\"(\w+)\": (\"(.+?)\")/g, (global, m1, m2) => {
        if (m1 === 'path') {
          return global;
        }
        return `'${m1}': ${m2.replace(/\"/g, '').replace(/\^/g, '"')}`;
      })
      .replace(/\"require\((.+?)\)"/g, (global, m1) => {
        return `require('${m1}')`;
      })
      .replace(/(\"\((.+?)\)\")/g, (global, m1) => {
        return `${m1.replace(/\"/g, '').replace(/\^/g, '"').replace(/\.tsx?/, '')}`;
      })
      .replace(/\\r\\n/g, '\r\n')
      .replace(/\\n/g, '\r\n')
      .replace(/\"/g, '\'')
      .replace(/\}(?!,)/g, '},')
      .replace(/](?!,)/g, '],')
      .replace(/,$/g, '')
      .replace(/'\)(?!,)/g, '\'),');
    return routesStr;
  }
  routes = stripRouteQuote(routes);

  return routes;
}

function getGlobalModels(globalModelPath) {
  const modelsPath = globalModelPath;
  let modelFiles = [];
  const models = [];
  if (fs.existsSync(modelsPath)) {
    modelFiles = fs.readdirSync(modelsPath);
  }
  modelFiles.forEach(model => {
    if (model.match(/\.(ts|tsx)$/)) {
      const modelName = model.match(/(\w*)\./)[1];
      if (modelName !== 'index') {
        const modelPath = path.resolve(modelsPath, model);
        models.push(`require(${modelPath})`);
      }
    }
  });

  return models;
}

function getModels(chunkName, currentPath) {
  let models = [];
  const singleModelFilePath = path.resolve(currentPath, 'model.ts');
  if (fs.existsSync(singleModelFilePath)) {
    models.push(generateImport(chunkName, singleModelFilePath));
  }
  const modelsFolderPath = path.resolve(currentPath, 'models');
  models = models.concat(loadModels(chunkName, modelsFolderPath));

  return models;
}

function loadModels(chunkName, currentPath) {
  let models = [];
  if (fs.existsSync(currentPath)) {
    const modelFiles = fs.readdirSync(currentPath);
    modelFiles.forEach(model => {
      const modelPath = path.resolve(currentPath, model);
      const stat = fs.lstatSync(modelPath);
      if (!stat.isDirectory()) {
        models.push(generateImport(chunkName, path.resolve(currentPath, model)));
      } else {
        models = models.concat(loadModels(chunkName, modelPath));
      }
    });
  }

  return models;
}

function loadContainer(key, chunkName, globalModels, parentPath, container, subFilesPath) {
  const components = {};
  const models = {};
  const containerPath = path.resolve(parentPath, container);
  components[key] = generateImport(chunkName, containerPath);
  models[key] = [
    ...globalModels,
    ...(getModels(chunkName, subFilesPath)),
  ];

  //  读取子containers
  const subContainers = fs.readdirSync(subFilesPath);
  subContainers.forEach(sub => {
    if (sub === 'models') {
      return;
    }
    const subPath = path.resolve(subFilesPath, sub);
    const stat = fs.lstatSync(subPath);
    if (!stat.isDirectory()) {
      return;
    }

    components[sub] = generateImport(chunkName, subPath);
    models[sub] = [
      ...models[key],
      ...(getModels(chunkName, subPath)),
    ];
  });

  return {
    components,
    models,
  };
}

function lowerFirstCase(str) {
  return str.substring(0, 1).toLowerCase() + str.substring(1);
}
