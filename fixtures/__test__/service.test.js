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
})

describe('service', () => {
  test('exist plugin', () => {
    expect(existPlugin('afwebpack-config')).toEqual(true);
    expect(existPlugin('epig-plugin-mock')).toEqual(true);
    expect(existPlugin('epig-plugin-html')).toEqual(true);
    expect(existPlugin('epig-plugin-hd')).toEqual(true);
    expect(existPlugin('pluginTest')).toEqual(true);
  })
})