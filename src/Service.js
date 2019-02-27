const chalk = require('chalk');
const assert = require('assert');
const PluginAPI = require('./PluginAPI');
const getUserConfig = require('./getUserConfig');
const getPlugins = require('./getPlugins');
const getWebpackConfig = require('./getWebpackConfig');

module.exports = class Service {
  constructor() {
    this.cwd = process.cwd();

    this.pluginMethods = {};

    this.registerMethod();

    // 获取用户 '.userrc.js' 配置
    this.config = getUserConfig();

    // 获取内置以及用户自定义的plugins
    this.plugins = this.resolvePlugins();

    // 注册插件
    this.initialPlugins();

    this.applyPlugins('afterInitPlugins');

    // 获取webpack配置
    this.webpackConfig = getWebpackConfig(this);
  }

  registerMethod() {
    [
      'afterInitPlugins',
      'modifyWebpackConfig',
      // dev
      'onStart',
      'beforeServerWithApp',
      'beforeDevServer',
      'afterDevServer',
      'onDevCompileDone',
      // build
      'onBuildSuccess',
      'onBuildFail',
    ].forEach(name => {
      if (!this.pluginMethods[name]) {
        this.pluginMethods[name] = [];
      } else {
        console.error(`this.pluginMethods.${name} exists.`);
        process.exit(1);
      }
    });
  }

  /**
   * 解析插件
   */
  resolvePlugins() {
    try {
      assert(
        Array.isArray(this.config.plugins || []),
        `Configure item ${chalk.underline.cyan(
          'plugins',
        )} should be Array, but got ${chalk.red(typeof this.config.plugins)}`,
      );
      return getPlugins(this.config);
    } catch (e) {
      console.error('resolvePlugins error:', e);
      process.exit(1);
    }
  }

  initialPlugins() {
    this.plugins.forEach(p => {
      p.apply(new PluginAPI(p.id, p.opts, this));
    });
  }

  /**
   * 应用插件
   * @param {*} key 
   * @param {*} opts 
   */
  applyPlugins(key, opts = {}) {
    return (this.pluginMethods[key] || []).reduce((memo, { fn, opts: pluginOpts }) => {
      try {
        return fn({
          memo,
          opts: pluginOpts,
          args: opts.args,
        });
      } catch (e) {
        console.log(chalk.red(`Plugin apply failed: ${e.message}`));
        throw e;
      }
    }, opts.initialValue);
  }
}
