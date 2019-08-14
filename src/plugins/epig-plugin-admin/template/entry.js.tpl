/* tslint:disable */
import TTApp from '@epig/admin-tools';
import { reducers, sagas } from '../models';

import config from '../entry.config';

const app = new TTApp({
  ...config.app,
  model: {
    syncModels: {
      reducers,
      sagas,
    },
    ...(config.app.model || {}),
  },
  routes: () => require('./router'),
  commonContainers: () => (require('./commonContainers') || {}),
});

app.start(config.root);

window['app'] = app;

declare const module: any;
if (module.hot) {
  module.hot.accept('./router', () => {
    // 当window['hotReload'] = true，不使用缓存的组件，达到热加载的效果
    window['hotReloadLayout'] = true;
    window['hotReload'] = true;
    app.start(config.root);
  });
  module.hot.accept('./commonContainers', () => {
    // 当window['hotReload'] = true，不使用缓存的组件，达到热加载的效果
    window['hotReload'] = true;
    app.start(config.root);
  });
}
