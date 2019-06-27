# af-build-dev
> 基于[af-webpack](https://github.com/umijs/umi/tree/master/packages/af-webpack)的前端构建编译工具

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
参考[af-webpack](https://umijs.org/zh/config/#webpack)中的webpack配置项

由于af-build-dev内建chainConfig支持,请不要配置chainConfig，其他配置项和合并到内置配置项。

### .epigrc.js 配置项

> 在此配置文件中也可以配置 .webpackrc.js 的同名配置项，会合并使用(优先级:.epigrc.js>.webpackrc.js), 但是配置在此的配置项不会进行检查。

#### [plugins](./Plugins.md)

- 类型：Array

数组项支持为插件名字或者自定义方法。

如果插件有参数，则通过数组的形式进行配置，第一项是插件名字或Function，第二项是参数，类似 babel 插件的配置方式。

无参数

```js
  plugins: [
    ['epig-plugin-admin'],
  ],
```

有参数

```js
  plugins: [
    ['epig-plugin-admin', {noAutoRoute: true}],
  ],
```

#### chainWebpack

可支持链式配置webpack配置，参考[webpack-chain](https://github.com/neutrinojs/webpack-chain)

```js
chainWebpack(config, { webpack }) {
  // 设置 alias
  config.resolve.alias.set('a', 'path/to/a');
}
 
```

#### targets

babel语法兼容配置

```js
// 支持ie11
targets: {
  ie: 11,
}
```