import chokidar from 'chokidar';
import { resolve } from 'path';
import { readFileSync, writeFileSync, existsSync, readdirSync, lstatSync } from 'fs';
import launchRouterPoint from './launchRouterPoint';
import { IApi } from '../../interface';
import { immitEntry } from '../../utils';

interface AdminRouteOptions {
  async: boolean;
  noAutoModel: boolean;
  containerPath: string;
  commonContainerPath: string;
}

const loadUrls = [];

export default function (api: IApi, opts: Partial<AdminRouteOptions> = {}) {
  const { async, noAutoModel } = opts;
  const dev = process.env.NODE_ENV === 'development';

  const containersPath = opts.containerPath || resolve('src/containers');
  const commonContainersPath = opts.commonContainerPath || resolve('src/commonContainers');
  const tmpFolderPath = resolve('src/.admin-tools');

  startGenerateRoutes(containersPath, dev && async, noAutoModel);
  startGenerateCommonContainers(commonContainersPath);

  const watchers = [];

  if (dev) {
    if (async) {
      api.modifyEntry((memo, args) => {
        return immitEntry(memo, [require.resolve('./webpackAsyncRouterDevClient')]);
      });
      api.beforeServerWithApp(({ app }) => {
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
    } else {
      createWatch(containersPath, () => {
        startGenerateRoutes(containersPath, false, noAutoModel);
      });
      createWatch(commonContainersPath, () => {
        startGenerateCommonContainers(commonContainersPath);
      });
      process.on('SIGINT', () => {
        watchers.map(watcher => {
          watcher.close();
        });
      });
    }
  }

  function startGenerateRoutes(containersPath, dev, noModel) {
    const routes = getRouterInfo(containersPath, dev, noModel);
    generateRoutes(routes);
  }

  function createWatch(targetPath, handle) {
    const watcher = chokidar.watch(targetPath);
    watcher.on('change', () => {
      handle();
    });
    watcher.on('add', () => {
      handle();
    });
    watcher.on('unlink', () => {
      handle();
    });
    watchers.push(watcher);
  }

  function startGenerateCommonContainers(containersPath) {
    const routes = getCommonContainers(containersPath);
    generateCommonContainers(routes);
  }

  function generateRoutes(routes) {
    // route模板文件
    const routeTplPath = resolve(__dirname, './template/router.js.tpl');
    let tplContent = readFileSync(routeTplPath, 'utf-8');
    tplContent = tplContent.replace('<%= routes %>', () => routes);

    const routerPath = resolve(tmpFolderPath, 'router.ts');
    writeFileSync(routerPath, tplContent, { encoding: 'utf-8' });
  }

  function generateImport(chunkName, path) {
    return `() => import (/* webpackChunkName: ^${chunkName}^ */\r\n      '${path}')`;
  }

  function getCommonContainers(containersPath) {
    let chunkFolders = [];
    const result = {};
    if (existsSync(containersPath)) {
      chunkFolders = readdirSync(containersPath);
    }
    chunkFolders.map(chunk => {
      const chunkPath = resolve(containersPath, chunk);
      result[chunk] = {
        component: generateImport('cContainers', chunkPath),
        models: getModels('cContainers', chunkPath),
      };
    });

    const routes = stripRouteQuote(result);

    return routes;
  }

  function generateCommonContainers(commonContainers) {
    // commonContainers模板文件
    const routeTplPath = resolve(__dirname, './template/commonContainers.js.tpl');
    let tplContent = readFileSync(routeTplPath, 'utf-8');
    tplContent = tplContent.replace('<%= containers %>', () => commonContainers);

    const routerPath = resolve(tmpFolderPath, 'commonContainers.ts');
    writeFileSync(routerPath, tplContent, { encoding: 'utf-8' });
  }

  function isIgnoreFile(fileName) {
    /**
     * 排除文件
     * .DS_Store
     * hooks
     * components
     */
    return fileName === '.DS_Store' || fileName === 'hooks' || fileName === 'components';
  }

  function getRouterInfo(containersPath, dev, noModel) {
    const routerInfos = [];
    let chunkFolders = [];
    if (existsSync(containersPath)) {
      chunkFolders = readdirSync(containersPath);
    }
    const globalModels = getGlobalModels(resolve('src/models'));
    chunkFolders.forEach(chunkFolder => {
      if (isIgnoreFile(chunkFolder)) {
        return;
      }
      const folderPath = resolve(containersPath, chunkFolder);
      const containers = readdirSync(folderPath);
      const chunkName = lowerFirstCase(chunkFolder);
      const isIndex = existsSync(resolve(folderPath, 'index.tsx'));
      let currentGlobalModels = [...globalModels];
      containers.forEach(container => {
        // 如果是models文件夹，跳过
        if (container === 'models') {
          return;
        }
        if (isIgnoreFile(container)) {
          return;
        }
        let components = {};
        let models = {};
        let routerPath = '';
        const containerPath = resolve(folderPath, container);
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
        const stat = lstatSync(containerPath);
        if (!stat.isDirectory() && !isIndex) {
          return;
        }

        if (!isIndex) {
          currentGlobalModels = currentGlobalModels.concat(getModels(chunkName, folderPath));
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
            routerInfo['models'] = models;
          }
          routerInfos.push(routerInfo);
        }
      });
    });

    const routes = stripRouteQuote(routerInfos);

    return routes;
  }

  function stripRouteQuote(routeInfos) {
    let routesStr = JSON.stringify(routeInfos, null, 2);
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

  function getGlobalModels(globalModelPath) {
    const modelsPath = globalModelPath;
    let modelFiles = [];
    const models = [];
    if (existsSync(modelsPath)) {
      modelFiles = readdirSync(modelsPath);
    }
    modelFiles.forEach(model => {
      if (isIgnoreFile(model)) {
        return;
      }
      if (model.match(/\.(ts|tsx)$/)) {
        const modelName = model.match(/(\w*)\./)[1];
        if (modelName !== 'index') {
          const modelPath = resolve(modelsPath, model);
          models.push(`require(${modelPath})`);
        }
      }
    });

    return models;
  }

  function getModels(chunkName, currentPath) {
    let models = [];
    const singleModelFilePath = resolve(currentPath, 'model.ts');
    if (existsSync(singleModelFilePath)) {
      models.push(generateImport(chunkName, singleModelFilePath));
    }
    const modelsFolderPath = resolve(currentPath, 'models');
    models = models.concat(loadModels(chunkName, modelsFolderPath));

    return models;
  }

  function loadModels(chunkName, currentPath) {
    let models = [];
    if (existsSync(currentPath)) {
      const modelFiles = readdirSync(currentPath);
      modelFiles.forEach(model => {
        if (isIgnoreFile(model)) {
          return;
        }
        const modelPath = resolve(currentPath, model);
        const stat = lstatSync(modelPath);
        if (!stat.isDirectory()) {
          models.push(generateImport(chunkName, resolve(currentPath, model)));
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
    const containerPath = resolve(parentPath, container);
    components[key] = generateImport(chunkName, containerPath);
    models[key] = [
      ...globalModels,
      ...(getModels(chunkName, subFilesPath)),
    ];

    //  读取子containers
    const subContainers = readdirSync(subFilesPath);
    subContainers.forEach(sub => {
      if (sub === 'models') {
        return;
      }
      if (isIgnoreFile(sub)) {
        return;
      }
      const subPath = resolve(subFilesPath, sub);
      const stat = lstatSync(subPath);
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
}
