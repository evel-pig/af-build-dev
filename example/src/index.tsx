import React, { Component } from 'react';
import ReactDom from 'react-dom';
import { Button } from 'antd';

class App extends Component {
  render() {
    return (
      <div>
        <Button>button</Button>
      </div>
    )
  }
}

function rendre() {
  ReactDom.render(<App />, document.getElementById('root'));
}

rendre();