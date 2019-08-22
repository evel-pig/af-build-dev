# Plugins

## 内置插件

```js
const builtInPlugins = [
  'afwebpack-config',
  'epig-plugin-mock',
  'epig-plugin-html',
];
```

- **自动配置入口**，在项目`src`目录下查找`src/index.tsx`或者`src/index.jsx`入口;
- **自动配置polyfill**，在`modifyWebpackConfig`hooks入口处添加`polyfill`依赖;
- **自动配置HTML**，pc和wap端公用一套模板,高清方案通过插件支持;
- **自动配置动态加载**，自动配置`ant-design`,`antd-mobile`,`ant-design-pro`按需加载;
- **Mock功能支持**，检测`proxy.config.js`文件是否存在开启mock功能;
- **gzip功能支持**，支持一键开启gzip功能;

## 可配置插件列表

### epig-plugin-admin

管理后台

- 类型: Object

| NAME | NOTES | TYPE | DEFAULT_VALUE | REQUIRED |
| --- | --- | --- | --- | --- | 
| noAutoEntry | 禁止自动生成入口 | boolean | undefined | false |
| noAutoRoute | 禁止自动生成路由 | boolean | undefined | false |
| noAutoModel | 禁止自动生成model | boolean | undefined | false |
| noAutoCopy | 禁止自动拷贝根目录server文件夹(epig-plugin-copy-server) | boolean | undefined | false |
| noSplitChunks | 禁止拆分代码(epig-plugin-split-chunks) | boolean | undefined | false |
| async | - | boolean | undefined | false |
| cacheGroups | 拆分代码规则,noSplitChunks为true时该配置不起作用 | object | [Link](https://github.com/evel-pig/af-build-dev/blob/master/src/plugins/epig-plugin-admin/index.ts#L34) | false |
| containerPath | 自定义containers路径 | string | src/containers | false |
| commonContainerPath | 自定义common containers路径 | string | src/commonContainers | false |

### epig-plugin-copy-server

拷贝项目根目录的`server`文件夹,若epigrc没有配置`outputPath`输出路径，会将`outputPath`设置为`dist/static`

- 类型: Object

| NAME | NOTES | TYPE | DEFAULT_VALUE | REQUIRED |
| --- | --- | --- | --- | --- |
| output | 输出目录 | string | dist | false |

### epig-plugin-hd

配置移动端的高清方案

| NAME | NOTES | TYPE | DEFAULT_VALUE | REQUIRED |
| --- | --- | --- | --- | --- |
| theme | less变量 | Object | {} | false |
| px2rem | px2rem配置项 | Object | {} | false |
| noInject | 禁止自动注入高清脚本和fastclick | boolean | flase | false |
| psdWidth | 设计稿的宽度, inject为true时该配置项才生效 | 750 | false | false|

### epig-plugin-split-chunks

拆分JS bundle包，development开发环境下不拆分代码

- 类型: Object (参考[split-chunks-plugin](https://webpack.js.org/plugins/split-chunks-plugin/))

| NAME | NOTES | TYPE | DEFAULT_VALUE | REQUIRED |
| --- | --- | --- | --- | --- |
| force | development和prodution环境下都拆分代码 | boolean | false | false |

### epig-plugin-html

配置HTML模板

- 类型: Array | Object (参考[html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin#options)配置项)

template默认读取使用项目`./public/index.html`或者`./template/index.html`的模板,找不到的话，使用`af-build-dev`内置模板

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

### epig-plugin-mpa

配置多页面应用(生成多个HTML页面)

- 类型: Array (参考[html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin#options)配置项)

| NAME | NOTES | TYPE | DEFAULT_VALUE | REQUIRED |
| --- | --- | --- | --- | --- | 
| entry | 入口文件 | string | null | true |
| htmlName | html文件名(不可以重复) | string | 根据entry获取的上一级目录名 | false |
| mode | 配置wap端或者pc应用 | `wap`或`pc` | `wap` | false |

```js
['epig-plugin-mpa', [{
  entry: 'src/pages/index/index.tsx',
  title:'wap title',
}, {
  entry: 'src/pages/page2/index.tsx',
  mode: 'pc',
  title:'pc title',
}]],
```

### epig-plugin-sprite

配置生成雪碧图

- 类型: Array | Object 参考[webpack-spritesmith](https://github.com/mixtur/webpack-spritesmith#config)配置项

默认输出路径:`src/.epig-sprite`

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

- 类型: Array (参考[copy-webpack-plugin](https://github.com/webpack-contrib/copy-webpack-plugin)配置项)

默认输出路径:`src/.assets-map`

| NAME | NOTES | TYPE | DEFAULT_VALUE | REQUIRED |
| --- | --- | --- | --- | --- |
| disableMap | 禁止生成map的.ts文件 | boolean | false | false |
| mapOutput | 输出ts文件的路径 | string | src/.assets-map | false |

## 插件开发

### api hooks

- **插件触发顺序**，按照`内置插件-->配置插件`顺序执行;

- **hooks触发顺序**，如下类型定义代码顺序;

举例:插件配置顺序为`插件A-->插件B`,`插件A`存在`modifyAFWebpackOpts`以及`chainWebpackConfig`hooks,`插件B`存在`modifyAFWebpackOpts`hooks;

那么事件触发顺序为:`插件A modifyAFWebpackOpts`-->`插件B modifyAFWebpackOpts`-->`插件A chainWebpackConfig`;


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
- modify类的hook接收2个参数,且必须返回第一个参数,非modify类的hook只接收1个参数

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