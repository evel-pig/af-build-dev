import React, { Component } from 'react';
import ReactDom from 'react-dom';
import { Button } from 'antd';
import styles from './index.less';

class App extends Component {
  render() {
    return (
      <div>
        <Button>button</Button>
        <div className={styles['login']} />
        <div className={styles['register']} />
      </div>
    )
  }
}

function rendre() {
  ReactDom.render(<App />, document.getElementById('root'));
}

rendre();