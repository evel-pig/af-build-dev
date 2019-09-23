# af-build-dev

> 基于[af-webpack](https://github.com/umijs/umi/tree/master/packages/af-webpack)的前端构建编译工具，可零配置开箱使用

## usage

### 安装

```bash
$ npm i @epig/af-build-dev --save-dev
$ npm i @epig/af-build-dev -g #全局安装
```

### cli

```bash
$ epig dev # 启动开发服务器
$ epig build # 构建项目
```

## 配置项

### 环境变量

只列部分，详细参考af-webpack源码;

| NAME | NOTES | DEFAULT_VALUE |
| --- | --- | --- |
| PROT | 服务器端口 | 8000 |
| ANALYZE | `webpack-bundle-analyzer`插件开关 | undefined |
| SPEED_MEASURE | `speed-measure-webpack-plugin`插件开关 | undefined |
| COMPORESS | 压缩混淆js文件选项 | undefined |
| POLYFILL | babel polyfill 选项 | undefined |

### .webpackrc.js 配置项
参考[af-webpack](https://umijs.org/zh/config/#webpack)中的webpack配置项，推荐在`.epigrc.js`文件中配置

由于af-build-dev内建chainConfig支持,请不要配置chainConfig，其他配置项和合并到内置配置项。

### .epigrc.js 配置项

> 在此配置文件中也可以配置 .webpackrc.js 的同名配置项，会合并使用(优先级:.epigrc.js>.webpackrc.js), 但是配置在此的配置项不会进行检查。

#### plugins

通过数组的形式进行配置，第一项是插件名字或自定义插件，第二项(可选)为传进插件的参数，类似babel的配置方式

- **[插件列表](./docs/plugins.md)**

- 类型 Array

- example

```js
plugins: [
  ['epig-plugin-admin', {noAutoRoute: true}],
]
```

#### chainWebpack

支持链式配置webpack配置，参考[webpack-chain](https://github.com/neutrinojs/webpack-chain)

- 类型 Function

- example

```js
chainWebpack(chainConfig, { webpack }) {
  // 设置 alias
  chainConfig.resolve.alias.set('a', 'path/to/a');
}
```

#### targets

babel语法兼容配置,参考[@babel/preset-env](https://babeljs.io/docs/en/next/babel-preset-env.html#targets)

- 类型 Object

- example

```js
// 开启ie11支持
targets: {
  ie: 11,
}
```

#### gzip

构建时是否开启gzip压缩，生成的gz文件需配合`express-static-gzip`使用。参考[example](https://github.com/evel-pig/af-build-dev/blob/master/examples/simple/server/server.js)

- 类型 Boolean

- example

```js
gzip:true
```

#### scripts

将script脚本注入到html模板中，支持`head`以及`body`注入位置，支持`src`或者`content`模式;

- 类型 Array

```ts
export interface ScriptEnhanceOption {
  area?: 'head' | 'body';
  src?: string;
  content?: string;
}
```
- example

```js
scripts: [{
  src: 'https://as.alipayobjects.com/g/component/fastclick/1.0.6/fastclick.js',
}, {
  content: 'window.test="test";',
}, {
  area: 'body',
  content: 'window.end="end";',
}]
```