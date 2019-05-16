const path = require('path');
const Service = require('../../src/Service');

const basePath = path.resolve(process.cwd(), './fixtures');

const service = new Service({
  rcPath: path.resolve(basePath, '.epigrc.js'),
});

const epigRc = service.config;
const webpackRc = service.webpackConfig;
const plugins = service.plugins;

function existPlugin(name) {
  const _plugins = plugins.filter(plugin => plugin.id === name);
  return _plugins.length > 0;
}

describe('epigrc', () => {
  test('plugins config', () => {
    expect(epigRc.plugins).toEqual(
      expect.arrayContaining([
        ['epig-plugin-hd']
      ])
    );
  })
});

describe('webpack', () => {
  test('mode', () => {
    expect(webpackRc.mode).toEqual('production')
  })

  test('webpack alias preact', () => {
    expect(webpackRc.resolve.alias).toEqual(
      expect.objectContaining({
        react: 'preact',
      })
    )
  })

  test('webpack output dist', () => {
    expect(webpackRc.output.path).toEqual(
      path.resolve(process.cwd(), './dist')
    )
  })

  test('admin webpack optimization split chunks', () => {
    expect(webpackRc.optimization.splitChunks.cacheGroups).toEqual(
      expect.objectContaining({
        // 抽离admin-tools
        vendor: {
          test: /[\\/]node_modules[\\/](?!@epig\/admin-tools)/,
          name: 'vendor',
          chunks: 'all',
        },
        // 抽离antd && rc-*
        antd: {
          test: /(@ant-design|antd|rc-)/,
          name: 'antd',
          chunks: 'all',
          enforce: true,
          priority: 2,
        },
        wangEditor: {
          test: /wangEditor/,
          name: 'wangEditor',
          chunks: 'async',
          priority: 3,
          enforce: true,
        },
        commons: {
          name: 'commons',
          chunks: 'async',
          minChunks: 2,
          enforce: true,
          priority: 1,
        },
      })
    )
  })

  test('test webpack optimization split chunks', () => {
    expect(webpackRc.optimization.splitChunks.cacheGroups).toEqual(
      expect.objectContaining({
        test: {
          test: /(@ant-design|antd|rc-)/,
          name: 'antd',
          chunks: 'all',
        },
      })
    )
  })
})

describe('service', () => {
  test('exist plugin', () => {
    expect(existPlugin('afwebpack-config')).toEqual(true);
    expect(existPlugin('epig-plugin-mock')).toEqual(true);
    expect(existPlugin('epig-plugin-html')).toEqual(true);
    expect(existPlugin('epig-plugin-hd')).toEqual(true);
    expect(existPlugin('pluginTest')).toEqual(true);
    expect(existPlugin('epig-plugin-admin')).toEqual(true);
    expect(existPlugin('epig-plugin-split-chunks')).toEqual(true);
  })
})