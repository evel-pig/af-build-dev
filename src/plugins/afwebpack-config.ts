import { IApi } from '../interface';

export default function (api: IApi, opts) {
  console.log('afwebpack-config plugin opts:', opts);

  api.modifyAFWebpackOpts((memo, opts) => {
    console.log('afwebpack-config plugin api modifyAFWebpackOpts:', memo, opts);
  });
}
