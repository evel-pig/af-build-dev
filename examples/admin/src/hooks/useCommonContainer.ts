import React from 'react';
import useContainer from '@epig/admin-tools/lib/hooks/useContainer';

export default function useCommonContainer() {
  const { push } = useContainer();

  return React.useMemo(() => {
    return {
      pushInfo: (options = {}) => {
        push({
          componentName: 'Info',
          mode: 'modal',
          modalConfig: {
            title: 'info',
            width: 1280,
          },
        }, options);
      },
    };
  }, []);
}
