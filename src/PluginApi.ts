import assert from 'assert';
import isPlainObject from 'is-plain-object';
import { IService } from './Service';
import { Plugin } from './getPlugins';

export default class PluginApi {
  public service: IService;
  private id: string;
  private API_TYPE: Record<string, string>;

  constructor(id: string, service: IService) {
    this.id = id;
    this.service = service;
    this.API_TYPE = {
      MODIFY: 'modify',
      EVENT: 'event',
    };

    this._addMethods();
  }

  /**
   * 在对应的method中注册插件
   * @param hook
   * @param fn
   */
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

  /**
   * 注册插件的method
   * @param name
   * @param opts
   */
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
          return args[0](opts.memo, opts.args);
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

  /**
   * 允许在插件中再次注册一个新的插件
   * @param opts
   */
  public registerPlugin(opts: Plugin) {
    assert(isPlainObject(opts), `opts should be plain object, but got ${opts}`);
    const { id, apply } = opts;
    assert(id && apply, `id and apply must supplied`);
    assert(typeof id === 'string', `id must be string`);
    assert(typeof apply === 'function', `apply must be function`);

    assert(
      Object.keys(opts).every(key => ['id', 'apply', 'opts'].includes(key)),
      `Only id, apply and opts is valid plugin properties`,
    );
    this.service.extraPlugins.push(opts);
  }

  public applyPlugins(name, opts = {}) {
    this.service.applyPlugins(name, opts);
  }

  private _addMethods() {
    // 事件触发顺序
    [
      'modifyAFWebpackOpts',
      'chainWebpackConfig',
      'modifyEntry',
      'modifyWebpackConfig',
      /** only in dev env*/
      'onStart',
      'beforeServerWithApp',
      'beforeDevServer',
      'afterDevServer',
      'onDevCompileDone',
      /** only in build env*/
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
