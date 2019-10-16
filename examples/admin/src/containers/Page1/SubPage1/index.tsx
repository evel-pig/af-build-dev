import * as React from 'react';
import useCommonContainer from '@app/hooks/useCommonContainer';

export interface ISubpageProps {
}

export default function Subpage(props: ISubpageProps) {
  const { pushInfo } = useCommonContainer();

  return (
    <div>
      Page1-SubPage
      <button
        onClick={() => { pushInfo({ test: 'page1' }); }}
      >
        push Info
      </button>
    </div>
  );
}
