import { existsSync } from 'fs';
import getRealWebpackConfig from 'af-webpack/getConfig';
import getUserConfig from 'af-webpack/getUserConfig';
import getUserConfigPlugins from 'af-webpack/getUserConfigPlugins';
import assert from 'assert';
import { merge } from 'lodash';
import { IService } from './Service';

export default class UserConfig {
  service: IService;
  afWebpackOptNames: string[];

  constructor(service: IService) {
    this.service = service;
    this.afWebpackOptNames = getUserConfigPlugins().map(p => p.name);
  }

  getEpigConfig() {
    const rcPath = this.service.rcPath;
    if (existsSync(rcPath)) {
      delete require.cache[rcPath];
      let config = require(rcPath);
      if (config.default) {
        config = config.default;
      }
      return config;
    }
    return {};
  }

  getWebpackConfig() {
    const config = this.service.config;

    // 读取用户 .webpackrc ;
    const webpackrc = getUserConfig();

    const webpackOpts = {
      cwd: this.service.cwd,
    };

    // 筛选 .epigrc中的webpack opts配置项
    Object.keys(config).map(name => {
      if (this.afWebpackOptNames.includes(name)) {
        webpackOpts[name] = config[name];
      }
    });

    // 合并两份配置项;
    merge(webpackOpts, webpackrc.config);

    // 合并用户配置项以及内建afWebpackOpts
    const afWebpackOpts = this.service.applyPlugins('modifyAFWebpackOpts', {
      initialValue: webpackOpts,
    });

    // afWebpackOpts(.webpackrc | .epigrc)中不应该有chainConfig配置项;
    assert(
      !('chainConfig' in afWebpackOpts),
      `chainConfig should not supplied in .webpackrc.js or .epigrc.js file`,
    );

    afWebpackOpts.chainConfig = chainWebpack => {
      // 可通过chainWebpackConfig方式修改用户配置，比modifyWebpackConfig更灵活
      this.service.applyPlugins('chainWebpackConfig', {
        args: {
          chainWebpack: chainWebpack,
        },
      });

      // 可通过 .epigrc 中的chainWebpack 配置项配置webpackConfig
      if (config.chainWebpack) {
        config.chainWebpack(chainWebpack, {
          webpack: require('af-webpack/webpack'),
        });
      }
    };

    const webpackConfig = getRealWebpackConfig(afWebpackOpts);

    webpackConfig.entry = this.service.applyPlugins('modifyEntry', {
      initialValue: webpackConfig.entry || {},
    });

    // 可对最终的webpack config进行修改;
    return this.service.applyPlugins('modifyWebpackConfig', {
      initialValue: webpackConfig,
    });
  }
}
