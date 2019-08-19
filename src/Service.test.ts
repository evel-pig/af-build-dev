import { resolve } from 'path';
import Service from './Service';

function getBashPath(path) {
  return resolve('./fixtures/', path);
}

function createService(path) {
  const basePath = getBashPath(path);
  const service = new Service({
    rcPath: resolve(basePath, '.epigrc.js'),
    cwd: basePath,
  });
  service.init();
  return service;
}

describe('epigrc configs', () => {
  const service = createService('configs');
  it('epigrc configs', () => {
    expect(service.config).toEqual(
      expect.objectContaining({
        targets: {
          ie: 11,
        },
        gzip: true,
      }),
    );
  });

  it('webpack config', () => {
    expect(service.webpackConfig.entry).toEqual(expect.objectContaining({
      test: [
        getBashPath('configs/src/index.js'),
        resolve('public/polyfill.js'),
      ],
    }));
    expect(service.webpackConfig.output.path).toEqual(getBashPath('configs/dist'));
    expect(service.webpackConfig.mode).toEqual('production');
  });
});

describe('epigrc plugins', () => {
  const service = createService('plugins');
  it('plugins config', () => {
    expect(service.config.plugins).toHaveLength(6);
    /**  内置的html被覆盖,6+3-1 */
    expect(service.plugins).toHaveLength(8);
    expect(service.webpackConfig.optimization.splitChunks['cacheGroups']).toEqual(
      expect.objectContaining({
        test: {
          test: /(@ant-design|antd|rc-)/,
          name: 'antd',
          chunks: 'all',
        },
      }),
    );
  });

  it('plugins methods', () => {
    /** 4+5+2 */
    expect(Object.keys(service.pluginMethods)).toHaveLength(11);
  });
});
