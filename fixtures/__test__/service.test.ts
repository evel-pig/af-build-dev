import { resolve } from 'path';
import Service from '../../src/Service';

const basePath = resolve(process.cwd(), './fixtures');

const service = new Service({
  rcPath: resolve(basePath, '.epigrc.js'),
});

service.init();

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
        ['epig-plugin-hd'],
      ]),
    );
  });
});

describe('webpack', () => {
  test('mode', () => {
    expect(webpackRc.mode).toEqual('production');
  });

  test('webpack alias preact', () => {
    expect(webpackRc.resolve.alias).toEqual(
      expect.objectContaining({
        react: 'preact',
      }),
    );
  });

  test('webpack output dist', () => {
    expect(webpackRc.output.path).toEqual(
      resolve(process.cwd(), './dist'),
    );
  });

  test('admin webpack optimization split chunks', () => {
    expect(webpackRc.optimization.splitChunks['cacheGroups']).toEqual(
      expect.objectContaining({
        commons: {
          name: 'commons',
          chunks: 'async',
          minChunks: 2,
          enforce: true,
          priority: 1,
        },
      }),
    );
  });

  test('test webpack optimization split chunks', () => {
    expect(webpackRc.optimization.splitChunks['cacheGroups']).toEqual(
      expect.objectContaining({
        test: {
          test: /(@ant-design|antd|rc-)/,
          name: 'antd',
          chunks: 'all',
        },
      }),
    );
  });
});

describe('service', () => {
  test('exist plugin', () => {
    expect(existPlugin('afwebpack-config')).toEqual(true);
    expect(existPlugin('epig-plugin-mock')).toEqual(true);
    expect(existPlugin('epig-plugin-html')).toEqual(true);
    expect(existPlugin('epig-plugin-hd')).toEqual(true);
    expect(existPlugin('function:pluginTest')).toEqual(true);
    expect(existPlugin('epig-plugin-admin')).toEqual(true);
    expect(existPlugin('epig-plugin-split-chunks')).toEqual(true);
  });
});
