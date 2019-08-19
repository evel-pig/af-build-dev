import React, { Component } from 'react';
import ReactDom from 'react-dom';
import styles from '../../styles/index.less';

class App extends Component {
  render() {
    return (
      <div>
        <div className={styles['font-pc']}>pc</div>
        <div>text</div>
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
