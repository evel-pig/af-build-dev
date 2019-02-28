# af-build-dev
> 基于af-webpack的前端构建编译工具

## usage

### 安装

```bash
$ npm i @epig/af-build-dev --save-dev
```

### cli

```bash
$ af dev # 启动开发服务器
$ af build # 构建项目
```

### 配置项

#### .webpackrc.js 配置项
参考[af-webpack](https://umijs.org/zh/config/#webpack)中的webpack配置项

由于af-build-dev内建chainWebpack支持,请不要chainWebpack配置项，其他配置项和合并到内置配置项。

内置配置项

```JavaScript
  const webpackrc = {
    ...memo,
    publicPath: '/',
    disableDynamicImport: true,
    urlLoaderExcludes: [/\.html$/], // 避免url-loader打包html文件
    hash: isDev ? false : true,
    extraBabelPlugins: [
      [require.resolve('babel-plugin-import'), { libraryName: 'antd', style: true }],
      [require.resolve('babel-plugin-import'), { libraryName: 'antd-mobile', style: true }, 'antd-mobile'],
      ...(memo.extraBabelPlugins || []),
    ],
  }
```

#### .epigrc.js 配置项

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

#### html

- 类型: Array | Object

参考[html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin#options)配置项


## plugins

内置插件

```
const builtInPlugins = [
  'afwebpack-config',
  'epig-plugin-html',
  'epig-plugin-mock',
  'epig-plugin-copy-server',
];
```

### afwebpack-config

### epig-plugin-admin

### epig-plugin-html

### epig-plugin-mock

### epig-plugin-copy-server
