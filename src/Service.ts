import assert from 'assert';
import chalk from 'chalk';
import { paths } from './utils';
import PluginAPI from './PluginApi';
import getPlugins, { Plugin } from './getPlugins';
import UserConfig from './UserConfig';

export interface Options {
  cwd?: string;
  rcPath?: string;
}

export type IService = Service;

export default class Service {
  cwd: string;
  rcPath: string;
  config: any;

  pluginHooks: Record<string, any[]>;
  pluginMethods: Record<string, Function>;
  plugins: Plugin[];

  constructor(opts: Options = {}) {
    this.cwd = opts.cwd || paths.cwd;
    this.rcPath = opts.rcPath || paths.userConfig;
    this.config = {};

    this.pluginHooks = {};
    this.pluginMethods = {};
    this.plugins = [];
  }

  init() {
    const userConfig = new UserConfig(this);
    this.config = userConfig.getUserConfig();

    // resolve plugins
    this.plugins = this.resolvePlugins();
    this.initPlugins();
  }

  resolvePlugins() {
    try {
      assert(
        Array.isArray(this.config.plugins || []),
        `Configure item ${chalk.underline.cyan('plugins')} should be Array, but got ${chalk.red(
          typeof this.config.plugins,
        )}`,
      );
      return getPlugins({
        plugins: this.config.plugins || [],
      });
    } catch (e) {
      console.error(chalk.red(`Resolve plugins failed: ${e.message}`));
      process.exit(1);
    }
  }

  initPlugins() {
    this.plugins.forEach(plugin => {
      const { id, apply, opts } = plugin;
      try {
        assert(typeof apply === 'function', `plugin must export a function.`);
        const api = new Proxy(new PluginAPI(id, this), {
          get: (target, prop: string) => {
            if (this.pluginMethods[prop]) {
              return this.pluginMethods[prop];
            }
            if (
              [
                // methods
                'applyPlugins',
                // properties
                'cwd',
                'config',
                'webpackConfig',
              ].includes(prop)
            ) {
              if (typeof this[prop] === 'function') {
                return this[prop].bind(this);
              } else {
                return this[prop];
              }
            } else {
              return target[prop];
            }
          },
        });
        apply(api, opts);
      } catch (e) {
        console.error(`Plugin ${chalk.cyan.underline(id)} initialize failed.`);
        console.error(`Error message:\n${e.message}`);
        process.exit(1);
      }
    });
  }

  applyPlugins(key, opts: any = {}) {
    return (this.pluginHooks[key] || []).reduce((memo, { fn }) => {
      try {
        return fn({
          memo,
          args: opts.args,
        });
      } catch (e) {
        console.error(chalk.red(`Plugin apply failed: ${e.message}`));
        throw e;
      }
    }, opts.initialValue);
  }

  run() {
    this.init();

    // test
    this.applyPlugins('afterInit', {
      args: {},
    });
    this.applyPlugins('modifyAFWebpackOpts', {
      initialValue: {
        cwd: this.cwd,
      },
      args: {
        ssr: false,
      },
    });

  }
}
