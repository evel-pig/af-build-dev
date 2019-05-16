import React, { Component } from 'react';
import ReactDom from 'react-dom';

class App extends Component {
  render() {
    return (
      <div>
        ReactDom
      </div>
    )
  }
}

function rendre() {
  ReactDom.render(<App />, document.getElementById('root'));
}

rendre();