import { existsSync } from 'fs';
import { IService } from './Service';

export default class UserConfig {
  service: IService;
  config: any;

  constructor(service: IService) {
    this.service = service;
    this.config = {};
  }

  getUserConfig() {
    const rcPath = this.service.rcPath;
    if (existsSync(rcPath)) {
      delete require.cache[rcPath];
      let config = require(rcPath);
      if (config.default) {
        config = config.default;
      }
      this.config = config;
    }

    // Todo:配置校验

    return this.config;
  }
}
