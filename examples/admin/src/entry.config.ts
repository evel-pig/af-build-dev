import { TTAdminAppOptions } from '@epig/admin-tools';
import './app.less';

const config = {
  app: {
    persistConfig: {
      key: 'my-admin-app',
    },
    appName: '管理后台',
    noRequestMenu: true,
    customMenus: [{
      text: 'page1',
      name: 'page1',
      icon: 'rise',
      items: [
        {
          text: 'subPage1',
          name: 'subPage1',
          leaf: true,
        },
      ],
    }, {
      text: 'page2',
      name: 'page2',
      icon: 'rise',
      items: [
        {
          text: 'subPage2',
          name: 'subPage2',
          leaf: true,
        },
      ],
    }],
  } as TTAdminAppOptions,
  root: 'root',
};

export default config;
