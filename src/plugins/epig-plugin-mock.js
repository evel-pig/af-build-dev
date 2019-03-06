const fs = require('fs');
const isPlainObject = require('is-plain-object');
const proxy = require('http-proxy-middleware');
const chalk = require('chalk');
const chokidar = require('chokidar');
const utils = require('../utils');

function MOCK_START(req, res, next) {
  next();
}

function MOCK_END(req, res, next) {
  next();
}

module.exports = function (pluginApi) {
  pluginApi.register('beforeServerWithApp', ({ args: { app } }) => {
    function getMockConfig() {
      const { mockConfig, absNodeModules } = utils.paths;

      if (fs.existsSync(mockConfig)) {
        console.log(chalk.green('启动mock:'));
        const files = [];
        const realRequire = require.extensions['.js'];
        require.extensions['.js'] = (m, filename) => {
          if (filename.indexOf(absNodeModules) === -1) {
            files.push(filename);
          }
          delete require.cache[filename];
          return realRequire(m, filename);
        };
        const config = require(mockConfig); // eslint-disable-line
        require.extensions['.js'] = realRequire;
        return { config, files };
      }
      return {
        config: null,
        files: [mockConfig],
      };
    }

    function outputError(error) {
      if (!error) return;
      const filePath = error.message.split(': ')[0];
      const relativeFilePath = filePath.replace(appPath, '.');
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

    function runRealApplyMock(app, isWatch) {
      const { config } = getMockConfig();
      const realConfig = formatConfig(config);

      if (!realConfig) {
        return;
      }

      let startIndex = null;
      let endIndex = null;
      let routesLength = null;
      if (isWatch) {
        app._router.stack.forEach((item, index) => {
          if (item.name === 'MOCK_START') startIndex = index;
          if (item.name === 'MOCK_END') endIndex = index;
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

      if (watch) {
        const newRoutes = app._router.stack.splice(
          routesLength,
          app._router.stack.length - routesLength,
        );
        app._router.stack.splice(startIndex, 0, ...newRoutes);
      }
    }

    function applyMock(app, isWatch) {
      try {
        runRealApplyMock(app, isWatch);
      } catch (e) {
        outputError(e);
      }
    }

    function watch() {
      const { files } = getMockConfig();
      // const mockAPILength = realConfig.length;
      const watcher = chokidar.watch(files, {
        ignored: /node_modules/,
        persistent: true,
      });
      watcher.on('change', (path) => {
        console.log('\n', chalk.green(new Date().toLocaleString()), `${path.replace(utils.paths.cwd, '.')} change`);
        applyMock(app, true);
      });
    }

    applyMock(app, false);
    watch();
  })
};
