import { IApi } from '../interface';

export default function test(api: IApi, opts) {
  console.log('plugin opts:', opts);

  api.afterInit((opts) => {
    console.log('plugin api method opts:', opts);
  });
}
