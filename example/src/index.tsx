import React, { Component } from 'react';
import ReactDom from 'react-dom';
import { Button } from 'antd-mobile';
import styles from './index.less';
import txt from './assets/test.txt';

class App extends Component {
  render() {
    return (
      <div>
        <Button>button</Button>
        <div className={styles['login']} />
        <div>{txt}</div>
      </div>
    );
  }
}

function rendre() {
  ReactDom.render(<App />, document.getElementById('root'));
}

rendre();
