# admin-router

> 自动生成路由文件插件

- 根据 `containers` 文件夹自动生成路由文件，`containers` 下的文件结构要跟路由一致。
- [自动注册 model 的说明](https://github.com/umijs/umi/issues/171)

路由：

```text
/system/user
```

容器目录：

```text
├── Card
│   └── Product
│       └── index.tsx
└── System
    ├── EditPassword
    │   ├── index.tsx
    │   └── model.ts
    ├── index.tsx
    └── model.ts
```

路由文件:

```ts
module.exports = [
  {
    'path': '/card/product',
    'components': {
      'Product': () => import (/* webpackChunkName: 'card' */
      '/Users/fengzhihao/Projects/skywrath-mage/fixtures/admin/src/containers/Card/Product'),
    },
    'models': {
      'Product': [
        require('/Users/fengzhihao/Projects/skywrath-mage/fixtures/admin/src/models/common.ts'),
      ],
    },
  },
  {
    'path': '/system',
    'components': {
      'System': () => import (/* webpackChunkName: 'system' */
      '/Users/fengzhihao/Projects/skywrath-mage/fixtures/admin/src/containers/System/index'),
      'EditPassword': () => import (/* webpackChunkName: 'system' */
      '/Users/fengzhihao/Projects/skywrath-mage/fixtures/admin/src/containers/System/EditPassword'),
    },
    'models': {
      'System': [
        require('/Users/fengzhihao/Projects/skywrath-mage/fixtures/admin/src/models/common.ts'),,
        () => import (/* webpackChunkName: 'system' */
      '/Users/fengzhihao/Projects/skywrath-mage/fixtures/admin/src/containers/System/model'),
      ],
      'EditPassword': [
        require('/Users/fengzhihao/Projects/skywrath-mage/fixtures/admin/src/models/common.ts'),,
        () => import (/* webpackChunkName: 'system' */
      '/Users/fengzhihao/Projects/skywrath-mage/fixtures/admin/src/containers/System/model'),
        require('/Users/fengzhihao/Projects/skywrath-mage/fixtures/admin/src/models/common.ts'),,
        () => import (/* webpackChunkName: 'system' */
      '/Users/fengzhihao/Projects/skywrath-mage/fixtures/admin/src/containers/System/EditPassword/model'),
      ],
    },
  },
];

```