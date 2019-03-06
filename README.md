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

### 配置项

#### 环境变量

只列部分，详细参考af-webpack源码;

| NAME | NOTES | DEFAULT_VALUE |
| --- | --- | --- |
| PROT | 服务器端口 | 8000 |
| ANALYZE | `webpack-bundle-analyzer`插件开关 | undefined |
| SPEED_MEASURE | `speed-measure-webpack-plugin`插件开关 | undefined |

#### .webpackrc.js 配置项
参考[af-webpack](https://umijs.org/zh/config/#webpack)中的webpack配置项

由于af-build-dev内建chainConfig支持,请不要配置chainConfig，其他配置项和合并到内置配置项。

内置配置项

```JavaScript
  const webpackrc = {
    ...memo, // .webpackrc.js 配置项
    ...rest, // .epigrc.js配置项
    publicPath: '/',
    ignoreMomentLocale: true,
    disableDynamicImport: false,
    urlLoaderExcludes: [/\.(html|ejs)$/], // 避免url-loader打包html/ejs文件;
    hash: isDev ? false : true,
    extraBabelPlugins: [
      [require.resolve('@babel/plugin-syntax-dynamic-import')],
      [require.resolve('babel-plugin-import'), { libraryName: 'antd', style: true }],
      [require.resolve('babel-plugin-import'), { libraryName: 'antd-mobile', style: true }, 'antd-mobile'],
      ...(memo.extraBabelPlugins || []),
    ],
  }
```

#### .epigrc.js 配置项

> 在此配置文件中也可以配置 .webpackrc.js 的同名配置项，会合并使用(优先级:.epigrc.js>.webpackrc.js), 但是配置在此的配置项不会进行检查。

##### plugins

- 类型：Array

数组项支持为插件名字或者自定义方法。

如果插件有参数，则通过数组的形式进行配置，第一项是插件名字，第二项是参数，类似 babel 插件的配置方式。

无参数

```JavaScript
  plugins: [
    ['epig-plugin-admin'],
  ],
```

有参数

```JavaScript
  plugins: [
    ['epig-plugin-admin', {router: true}],
  ],
```

#### chainWebpack

可支持链式配置webpack配置，参考[webpack-chain](https://github.com/neutrinojs/webpack-chain)

```JavaScript
chainWebpack(config, { webpack }) {
  // 设置 alias
  config.resolve.alias.set('a', 'path/to/a');
}
 
```

## plugins

内置插件

```
const builtInPlugins = [
  'afwebpack-config',
  'epig-plugin-mock',
];
```

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
| async | - | boolean | undefined | 

### epig-plugin-html

配置HTML模板

- 类型: Array | Object

参考[html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin#options)配置项

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

### epig-plugin-enhance-copy

扩展copy时生成map，在原参数的基础上添加两个参数扩展;

- 类型: Array

参考[copy-webpack-plugin](https://github.com/webpack-contrib/copy-webpack-plugin)配置项

| NAME | NOTES | TYPE | DEFAULT_VALUE |
| --- | --- | --- | --- |
| disableMap | 禁止生成map的.ts文件 | boolean | false |
| mapTo | 输出ts文件的路径 | string | src/.copy-map |