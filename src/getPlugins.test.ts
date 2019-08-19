import getPlugins, { transformPlugin } from './getPlugins';

describe('transform plugin test', () => {
  it('transform string plugin ', () => {
    expect(transformPlugin('epig-plugin-html'))
      .toEqual(expect.objectContaining({
        id: 'epig-plugin-html',
        opts: {},
      }));
  });

  it('transform function plugin', () => {
    function fn(api, opts) { }
    expect(transformPlugin(fn, {}))
      .toEqual(expect.objectContaining({
        apply: fn,
        opts: {},
      }));
  });
});

describe('get plugins test', () => {
  it('get initial plugins', () => {
    expect(getPlugins({
      plugins: [],
    }))
      .toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: 'afwebpack-config',
        }),
        expect.objectContaining({
          id: 'epig-plugin-mock',
        }),
        expect.objectContaining({
          id: 'epig-plugin-html',
        }),
      ]));
  });

  it('get plugins with repeat config', () => {
    expect(getPlugins({
      plugins: [
        ['epig-plugin-html', { test: 'test' }],
      ],
    }))
      .toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: 'afwebpack-config',
        }),
        expect.objectContaining({
          id: 'epig-plugin-mock',
        }),
        expect.objectContaining({
          id: 'epig-plugin-html',
          opts: { test: 'test' },
        }),
      ]));
  });

  it('get plugins with fn plugin', () => {
    function fn(api, opts) { }
    expect(getPlugins({
      plugins: [
        fn,
      ],
    }))
      .toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: 'afwebpack-config',
        }),
        expect.objectContaining({
          id: 'epig-plugin-mock',
        }),
        expect.objectContaining({
          id: 'epig-plugin-html',
        }),
        expect.objectContaining({
          apply: fn,
        }),
      ]));
  });
});
