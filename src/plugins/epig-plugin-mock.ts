import { existsSync } from 'fs';
import chalk from 'chalk';
import chokidar from 'chokidar';
import isPlainObject from 'is-plain-object';
import proxy from 'http-proxy-middleware';
import { paths } from '../utils';
import { IApi } from '../interface';

export default function (api: IApi, opts: any = {}) {

  if (existsSync(paths.mockConfig)) {

    function getMockConfig() {
      let config = null;
      if (existsSync(paths.mockConfig)) {
        delete require.cache[paths.mockConfig];
        config = require(paths.mockConfig);
        if (config.default) {
          config = config.default;
        }
      }
      return config;
    }

    function formatConfig(config) {
      if (!config) {
        return null;
      }
      const realConfig = [];
      Object.keys(config).forEach((item) => {
        let pattern = '';
        let method = null;
        const hasMethod = item.match(/^(GET|POST|PUT|DELETE)/);
        if (hasMethod) {
          const [m] = hasMethod;
          method = m;
          pattern = item.replace(/^(GET|POST|PUT|DELETE)\s/, '');
        } else {
          pattern = item;
        }
        realConfig.push({
          method,
          pattern,
          val: config[item],
        });
      });
      return realConfig;
    }

    function MOCK_START(req, res, next) {
      next();
    }

    function MOCK_END(req, res, next) {
      next();
    }

    function outputError(error) {
      if (!error) {
        return null;
      }
      const filePath = error.message.split(': ')[0];
      const relativeFilePath = filePath.replace(paths.cwd, '.');
      const errors = error.stack.split('\n')
        .filter(line => line.trim().indexOf('at ') !== 0)
        .map(line => line.replace(`${filePath}: `, ''));
      errors.splice(1, 0, ['']);
      console.log(chalk.red('格式化proxy文件失败'));
      console.log();
      console.log(`Error in ${relativeFilePath}`);
      console.log(errors.join('\n'));
      console.log();
    }

    function getRouteKey(method) {
      switch (method) {
        case 'GET':
          return 'get';
        case 'POST':
          return 'post';
        case 'PUT':
          return 'put';
        case 'DELETE':
          return 'delete';
        default:
          return 'use';
      }
    }

    function isRewrite(pattern) {
      return !!pattern.match(/\(\.\*\)$/);
    }

    function getMatchPath(pattern) {
      return pattern.replace(/\/(\*|\(\.\*\))$/, '');
    }

    api.beforeServerWithApp(({ app }) => {

      console.log(chalk.green('启动mock:'));

      function runRealApplyMock(isWatch) {

        const config = getMockConfig();

        const realConfig = formatConfig(config);

        if (!realConfig) {
          return;
        }

        let startIndex = null;
        let endIndex = null;
        let routesLength = null;

        if (isWatch) {
          app._router.stack.forEach((item, index) => {
            if (item.name === 'MOCK_START') {
              startIndex = index;
            }
            if (item.name === 'MOCK_END') {
              endIndex = index;
            }
          });
          if (startIndex !== null && endIndex !== null) {
            app._router.stack.splice(startIndex, (endIndex - startIndex) + 1);
          }
          routesLength = app._router.stack.length;
        }

        app.use(MOCK_START);

        realConfig.forEach((item) => {
          const routeMethodKey = getRouteKey(item.method);
          if (isPlainObject(item.val)) {
            app[routeMethodKey](item.pattern, (req, res) => {
              return res.json(
                item.val,
              );
            });
          }
          if (typeof item.val === 'function') {
            app[routeMethodKey](item.pattern, item.val);
            return;
          }
          if (typeof item.val === 'string') {
            const matchPath = getMatchPath(item.pattern);
            if (isRewrite(item.pattern)) {
              app.use(matchPath, proxy({
                target: item.val,
                changeOrigin: true,
                pathRewrite: { [`^${matchPath}`]: '' },
              }));
            } else {
              app.use(matchPath, proxy({
                target: item.val,
                changeOrigin: true,
              }));
            }
          }
        });

        app.use(MOCK_END);

        if (isWatch) {
          const newRoutes = app._router.stack.splice(
            routesLength,
            app._router.stack.length - routesLength,
          );
          app._router.stack.splice(startIndex, 0, ...newRoutes);
        }
      }

      function applyMock(isWatch) {
        try {
          runRealApplyMock(isWatch);
        } catch (e) {
          outputError(e);
        }
      }

      function watch() {
        const watcher = chokidar.watch(paths.mockConfig, {
          ignored: /node_modules/,
          persistent: true,
        });
        watcher.on('change', (path) => {
          console.log('\n', chalk.green(new Date().toLocaleString()), `${path.replace(paths.cwd, '.')} change`);
          applyMock(true);
        });
      }

      applyMock(false);

      watch();
    });
  }
}
