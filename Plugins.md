## plugins

内置插件

```
const builtInPlugins = [
  'afwebpack-config',
  'epig-plugin-mock',
  'epig-plugin-html',
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
| noSplitChunks | 禁止拆分代码 | boolean | undefined |
| async | - | boolean | undefined | 
| cacheGroups | 拆分代码规则,noSplitChunks为true时该配置不起作用 | object | [link](https://github.com/evel-pig/af-build-dev/blob/master/src/plugins/epig-plugin-admin/index.js#L32) |

### epig-plugin-html

配置HTML模板

- 类型: Array | Object

参考[html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin#options)配置项

默认读取使用`./public/index.html`或者`./template/index.html`的模板

```javascript
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

### epig-plugin-enhance-copy

扩展copy时生成map，在原参数的基础上添加两个参数扩展;

- 类型: Array

参考[copy-webpack-plugin](https://github.com/webpack-contrib/copy-webpack-plugin)配置项

| NAME | NOTES | TYPE | DEFAULT_VALUE |
| --- | --- | --- | --- |
| disableMap | 禁止生成map的.ts文件 | boolean | false |
| mapTo | 输出ts文件的路径 | string | src/.copy-map |

### epig-plugin-split-chunks

拆分JS bundle包

参考[split-chunks-plugin](https://webpack.js.org/plugins/split-chunks-plugin/)

### epig-plugin-sprite

配置生成雪碧图

- 类型: Array | Object

参考[webpack-spritesmith](https://github.com/mixtur/webpack-spritesmith#config)配置项

```javascript
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