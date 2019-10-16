import * as React from 'react';

export interface IInfoProps {
  options: any;
}

export default function Info(props: IInfoProps) {
  return (
    <div>
      info:
      <div>{JSON.stringify(props.options)}</div>
    </div>
  );
}
