import React, { Component } from 'react';
import ReactDom from 'react-dom';
import styles from '../../styles/index.less';
import { test } from '../../utils';

class App extends Component {
  render() {
    return (
      <div>
        <div className={styles['font-wap']}>wap</div>
        <div>text</div>
        <div>{test}</div>
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
