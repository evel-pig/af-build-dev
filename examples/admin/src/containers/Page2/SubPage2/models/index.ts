import createModel from '@epig/luna/model';
import { makeListHandleActions, ListState } from '@epig/admin-tools/lib/model/listReducers';

export interface State extends ListState<any> {

}

const Model = createModel({
  modelName: 'aaa',
  action: {
    simple: {},
    api: {
      getList: {
        path: '/getList',
      },
    },
  },
  reducer: ({ apiActionNames, createReducer }) => {
    const listHandle = makeListHandleActions(apiActionNames.getList);
    return createReducer<State, any>({
      ...listHandle.handleActions,
    }, {
        ...listHandle.initializeState,
      });
  },
  sagas: () => {
    return [];
  },
});

export default Model;
