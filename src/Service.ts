import assert from 'assert';
import chalk from 'chalk';
import { cloneDeep } from 'lodash';
import { paths } from './utils';
import PluginAPI from './PluginApi';
import getPlugins, { Plugin } from './getPlugins';
import UserConfig from './UserConfig';
import getWebpackConfig from './getWebpackConfig';
import { Configuration, EpigConfig } from './interface';

export interface Options {
  cwd?: string;
  rcPath?: string;
}

export type IService = Service;

export default class Service {
  cwd: string;
  rcPath: string;

  config: EpigConfig;
  webpackConfig: Configuration;

  pluginHooks: Record<string, any[]>;
  pluginMethods: Record<string, Function>;
  plugins: Plugin[];
  extraPlugins: Plugin[];

  constructor(opts: Options = {}) {
    this.cwd = opts.cwd || paths.cwd;
    this.rcPath = opts.rcPath || paths.userConfig;

    /** epigrc 配置项 */
    this.config = {};
    /** webpack 配置项 */
    this.webpackConfig = {};

    /** plugins相关 */
    this.pluginHooks = {};
    this.pluginMethods = {};
    this.plugins = [];
    this.extraPlugins = [];
  }

  init() {
    const userConfig = new UserConfig(this);
    this.config = userConfig.getUserConfig();

    // resolve plugins
    this.plugins = this.resolvePlugins();
    this.initPlugins();

    this.applyPlugins('onInit');

    // get webpack config
    this.webpackConfig = getWebpackConfig(this);
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

  initPlugin(plugin) {
    const { id, apply, opts } = plugin;
    try {
      assert(typeof apply === 'function', `plugin must export a function.`);
      const api = new Proxy(new PluginAPI(id, this), {
        get: (target, prop: string) => {
          if (this.pluginMethods[prop]) {
            return this.pluginMethods[prop];
          }
          return target[prop];
        },
      });
      apply(api, opts);
    } catch (e) {
      console.error(`Plugin ${chalk.cyan.underline(id)} initialize failed.`);
      console.error(`Error message:\n${e.message}`);
      process.exit(1);
    }
  }

  initPlugins() {
    this.plugins.forEach(plugin => {
      this.initPlugin(plugin);
    });

    let count = 0;
    while (this.extraPlugins.length) {
      const extraPlugins = cloneDeep(this.extraPlugins);
      this.extraPlugins = [];
      extraPlugins.forEach(plugin => {
        this.initPlugin(plugin);
        this.plugins.push(plugin);
      });
      count += 1;
      assert(count <= 10, `插件注册死循环？`);
    }
  }

  applyPlugins(key, opts: { args?: any, initialValue?: any } = {}) {
    return (this.pluginHooks[key] || []).reduce((memo, { fn }) => {
      try {
        return fn({
          memo,
          args: opts.args || {},
        });
      } catch (e) {
        console.error(chalk.red(`Plugin apply failed: ${e.message}`));
        throw e;
      }
    }, opts.initialValue);
  }
}
