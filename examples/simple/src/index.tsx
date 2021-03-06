import React, { Component } from 'react';
import ReactDom from 'react-dom';
import { Button } from 'antd-mobile';
import Login from '@app/components/Login';
import txt from './assets/test.txt';

class App extends Component {
  render() {
    return (
      <div>
        <Button>button</Button>
        <Login />
        <div>{txt}</div>
      </div>
    );
  }
}

function rendre() {
  ReactDom.render(<App />, document.getElementById('root'));
}

rendre();

declare const module: any;
if (module.hot) {
  module.hot.accept();
}
