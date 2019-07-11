# Plugins

插件执行顺序:按照内置插件顺序执行,然后按照`.epigrc.js`配置中`plugins`顺序执行

内置插件

```js
const builtInPlugins = [
  'afwebpack-config',
  'epig-plugin-mock',
];
```

## 插件列表

### afwebpack-config

内置自定义webpack配置项

### epig-plugin-mock

mock功能

### epig-plugin-admin

管理后台

- 类型: Object

| NAME | NOTES | TYPE | DEFAULT_VALUE |
| --- | --- | --- | --- |
| noAutoEntry | 禁止自动生成入口 | boolean | undefined |
| noAutoRoute | 禁止自动生成路由 | boolean | undefined |
| noAutoModel | 禁止自动生成model | boolean | undefined |
| noSplitChunks | 禁止拆分代码 | boolean | undefined |
| async | - | boolean | undefined | 
| cacheGroups | 拆分代码规则,noSplitChunks为true时该配置不起作用 | object | [Link](https://github.com/evel-pig/af-build-dev/blob/master/src/plugins/epig-plugin-admin/index.js#L35) |

### epig-plugin-copy-server

拷贝项目根目录的`server`文件夹

- 类型: Object

| NAME | NOTES | TYPE | DEFAULT_VALUE |
| --- | --- | --- | --- |
| output | 输出目录 | string | 同webpack.output.path |


### epig-plugin-hd

配置移动端的高清方案

| NAME | NOTES | TYPE | DEFAULT_VALUE |
| --- | --- | --- | --- |
| theme | less变量 | Object | {} |
| px2rem | px2rem配置项 | Object | {} |
| inject | 自动注入高清脚本和fastclick | boolean | false |
| psdWidth | 设计稿的宽度, inject为true时该配置项才生效 | 750 |

### epig-plugin-split-chunks

拆分JS bundle包

类型: Object

参考[split-chunks-plugin](https://webpack.js.org/plugins/split-chunks-plugin/)

| NAME | NOTES | TYPE | DEFAULT_VALUE |
| --- | --- | --- | --- |
| disableMap | 禁止生成map的.ts文件 | boolean | false |
| mapOutput | 输出ts文件的路径 | string | src/.copy-map |

### epig-plugin-html

配置HTML模板

类型: Array | Object

参考[html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin#options)配置项

默认读取使用项目`./public/index.html`或者`./template/index.html`的模板,找不到的话，使用`af-build-dev`内置模板

```js
// 默认参数
['epig-plugin-html']
// object格式
['epig-plugin-html',{
  template: path.resolve(__dirname,'template/index.html'),
}]
// array格式
['epig-plugin-html', [{
  template: path.resolve(__dirname,'template/index.html'),
}, {
  filename:'test.html'
  template: path.resolve(__dirname,'template/test.html'),
}]]
```

### epig-plugin-sprite

配置生成雪碧图

默认输出路径:`src/.epig-sprite`

类型: Array | Object

参考[webpack-spritesmith](https://github.com/mixtur/webpack-spritesmith#config)配置项

```js
// object格式
['epig-plugin-sprite', {
    src: {
      cwd: path.resolve(__dirname, './src/assets/icons'),
    },
}]
// array格式
['epig-plugin-sprite', [{
  src: {
    cwd: path.resolve(__dirname, './src/assets/icons1'),
  },
}, {
  src: {
    cwd: path.resolve(__dirname, './src/assets/icons2'),
  },
}]]
```

### epig-plugin-enhance-copy

扩展copy时生成对应的map，在原参数的基础上添加两个参数扩展

默认输出路径:`src/.assets-map`

类型: Array

参考[copy-webpack-plugin](https://github.com/webpack-contrib/copy-webpack-plugin)配置项

| NAME | NOTES | TYPE | DEFAULT_VALUE |
| --- | --- | --- | --- |
| disableMap | 禁止生成map的.ts文件 | boolean | false |
| mapOutput | 输出ts文件的路径 | string | src/.assets-map |

## 插件开发

### api hooks

hooks触发顺序为以下顺序

```ts
export type EventMethod<T = {}> = (fn: (args: T) => void) => void;
export type MoidfyMethod<T, U = {}> = (fn: (memo: T, args: U) => T) => void;

export type IPluginApi = PluginApi;

export interface IApi extends IPluginApi {
  modifyAFWebpackOpts: MoidfyMethod<IAFWebpackConfig>;
  chainWebpackConfig: EventMethod<{ chainWebpack: IWebpackChainConfig }>;
  modifyEntry: MoidfyMethod<Entry>;
  modifyWebpackConfig: MoidfyMethod<Configuration>;
  /** only in dev env*/
  onStart: EventMethod;
  beforeServerWithApp: EventMethod<{ app: express.Application }>;
  beforeDevServer: EventMethod<{ devServer: WebpackDevServer }>;
  afterDevServer: EventMethod<{ devServer: WebpackDevServer }>;
  onDevCompileDone: EventMethod<{ stats: Stats }>;
  /** only in build env*/
  onBuildSuccess: EventMethod<{ stats: Stats }>;
  onBuildFail: EventMethod<{ stats: Stats, err: any }>;
}
```

tips:
- modify类的hook接收2个参数,且必须返回第一个参数

### 自定义插件Demo

```js
/**
 * 插件接收2个参数
 * api: api hooks
 * opts: epigrc中plugins对应插件配置项的第二个参数
 */
module.exports = (api, opts = {}) => {
  api.modifyAFWebpackOpts((memo, args) => {
    return {
      ...memo,
      alais: {
        ...(memo.alais || {}),
        ...opts
      },
    }
  });
}

// .epigrc.js
plugins: [
  [require('path/to/plugin'), { react: 'preact-compat' }],
]
```