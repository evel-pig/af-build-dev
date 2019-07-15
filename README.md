# af-build-dev

> 基于[af-webpack](https://github.com/umijs/umi/tree/master/packages/af-webpack)的前端构建编译工具，可开箱使用

## usage

### 安装

```bash
$ npm i @epig/af-build-dev --save-dev
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

### .webpackrc.js 配置项
参考[af-webpack](https://umijs.org/zh/config/#webpack)中的webpack配置项，推荐在`.epigrc.js`文件中配置

由于af-build-dev内建chainConfig支持,请不要配置chainConfig，其他配置项和合并到内置配置项。

### .epigrc.js 配置项

> 在此配置文件中也可以配置 .webpackrc.js 的同名配置项，会合并使用(优先级:.epigrc.js>.webpackrc.js), 但是配置在此的配置项不会进行检查。

#### plugins

- **[插件列表](./Plugins.md)**

- 类型 Array

通过数组的形式进行配置，第一项是插件名字或自定义插件，第二项(可选)为传进插件的参数，类似babel的配置方式

```js
plugins: [
  ['epig-plugin-admin', {noAutoRoute: true}],
]
```

#### chainWebpack

- 类型 Function

支持链式配置webpack配置，参考[webpack-chain](https://github.com/neutrinojs/webpack-chain)

```js
chainWebpack(chainConfig, { webpack }) {
  // 设置 alias
  chainConfig.resolve.alias.set('a', 'path/to/a');
}
```

#### targets

babel语法兼容配置,参考[@babel/preset-env](https://babeljs.io/docs/en/next/babel-preset-env.html#targets)

- 类型 Object

```js
// 开启ie11支持
targets: {
  ie: 11,
}
```

#### gzip

构建时是否开启gzip压缩，生成的gz文件需配合`express-static-gzip`使用。参考[example](https://github.com/evel-pig/af-build-dev/blob/ts/examples/simple/server/server.js)

- 类型 Boolean

```js
gzip:true
```