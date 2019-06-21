import assert from 'assert';
import { IService } from './Service';

export default class PluginApi {
  id: string;
  service: IService;
  API_TYPE: Record<string, string>;

  constructor(id: string, service: IService) {
    this.id = id;
    this.service = service;
    this.API_TYPE = {
      MODIFY: 'modify',
      EVENT: 'event',
    };

    this._addMethods();
  }

  public register(hook: string, fn: Function) {
    assert(
      typeof hook === 'string',
      `The first argument of api.register() must be string, but got ${hook}`,
    );
    assert(
      typeof fn === 'function',
      `The second argument of api.register() must be function, but got ${fn}`,
    );
    const { pluginHooks } = this.service;
    pluginHooks[hook] = pluginHooks[hook] || [];
    pluginHooks[hook].push({
      fn,
    });
  }

  public registerMethod(name: string, opts: { type: string }) {
    assert(!this[name], `api.${name} exists.`);
    assert(opts, `opts must supplied.`);
    const { type } = opts;
    assert(type, `type must supplied.`);

    const { pluginMethods } = this.service;

    pluginMethods[name] = (...args) => {
      // modify类的会传递memo,fn第一个参数为memo，且fn必须返回memo;
      if (type === this.API_TYPE.MODIFY) {
        this.register(name, opts => {
          return typeof args[0] === 'function' ? args[0](opts.memo, opts.args) : args[0];
        });
      } else if (type === this.API_TYPE.EVENT) {
        this.register(name, opts => {
          return args[0](opts.args);
        });
      } else {
        throw new Error(`unexpected api type ${type}`);
      }
    };
  }

  private _addMethods() {
    [
      'afterInit',
      'modifyAFWebpackOpts',
      'chainWebpackConfig',
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
    ].forEach(method => {
      let type;
      if (method.indexOf('modify') === 0) {
        type = this.API_TYPE.MODIFY;
      } else {
        type = this.API_TYPE.EVENT;
      }
      this.registerMethod(method, { type });
    });
  }
}
