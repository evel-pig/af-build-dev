import * as React from 'react';
import useContainer from '@epig/admin-tools/lib/hooks/useContainer';

export interface ISubpageProps {
}

export default function Subpage (props: ISubpageProps) {
  const { push } = useContainer();

  return (
    <div>
      Page1-SubPage
      <button
        onClick={() => {
          push({
            componentName: 'Info',
          }, {});
        }}
      >
        push Info
      </button>
    </div>
  );
}
