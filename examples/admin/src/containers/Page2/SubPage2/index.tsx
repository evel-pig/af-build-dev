import React from 'react';
import useCommonContainer from '@app/hooks/useCommonContainer';

export default function SubPage() {

  const { pushInfo } = useCommonContainer();

  return (
    <div>
      Page2-SubPage
      <button
        onClick={() => { pushInfo({ test: 'page2' }); }}
      >
        push-----Info
      </button>
    </div>
  );
}
