const assert = require('assert');

module.exports = class PluginApi {
  constructor(id, opts, service) {
    this.id = id;
    this.opts = opts;
    this.service = service;
  }

  register(method, fn) {
    assert(
      typeof method === 'string',
      `The first argument of pluginApi.register() must be string, but got ${method}`,
    );
    assert(
      typeof fn === 'function',
      `The second argument of pluginApi.register() must be function, but got ${fn}`,
    );
    if (this.service.pluginMethods[method]) {
      this.service.pluginMethods[method].push({
        fn,
        id: this.id,
        opts: this.opts,
      });
    } else {
      console.error(`将要注册的method(${method})不存在已有methods(${this.service.pluginMethods})中`);
      process.exit(1);
    }
  }
};
