import chokidar from 'chokidar';
import { resolve } from 'path';
import { readFileSync, writeFileSync, existsSync, readdirSync, lstatSync } from 'fs';
import launchRouterPoint from './launchRouterPoint';
import { IApi } from '../../interface';
import { immitEntry } from '../../utils';

const loadUrls = [];

export default function (api: IApi, opts: any = {}) {
  const { async, noAutoModel } = opts;
  const dev = process.env.NODE_ENV === 'development';

  const containersPath = resolve('src/containers');
  const tmpFolderPath = resolve('src/.admin-tools');

  startGenerateRoutes(containersPath, dev && async, noAutoModel);

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
      watch(containersPath, noAutoModel);
    }
  }

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
    const routeTplPath = resolve(__dirname, './template/router.js.tpl');
    let tplContent = readFileSync(routeTplPath, 'utf-8');
    tplContent = tplContent.replace('<%= routes %>', () => routes);

    const routerPath = resolve(tmpFolderPath, 'router.ts');
    writeFileSync(routerPath, tplContent, { encoding: 'utf-8' });
  }

  function generateImport(chunkName, path) {
    return `() => import (/* webpackChunkName: ^${chunkName}^ */\r\n      '${path}')`;
  }

  function getRouterInfo(containersPath, dev, noModel) {
    const routerInfos = [];
    let chunkFolders = [];
    if (existsSync(containersPath)) {
      chunkFolders = readdirSync(containersPath);
    }
    const globalModels = getGlobalModels(resolve('src/models'));
    chunkFolders.forEach(chunkFolder => {
      const folderPath = resolve(containersPath, chunkFolder);
      const containers = readdirSync(folderPath);
      const chunkName = lowerFirstCase(chunkFolder);
      const isIndex = existsSync(resolve(folderPath, 'index.tsx'));
      let currentGlobalModels = [...globalModels];
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
    if (existsSync(modelsPath)) {
      modelFiles = readdirSync(modelsPath);
    }
    modelFiles.forEach(model => {
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
