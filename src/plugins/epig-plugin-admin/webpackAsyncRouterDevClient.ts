import launchRouterPoint from './launchRouterPoint';

class AdminRouterAsync {
  handlers = {};

  on(type, handler) {
    if (!this.handlers[type]) {
      this.handlers[type] = [];
    }
    this.handlers[type].push(handler);
  }

  send(e) {
    if (this.handlers[e.type]) {
      this.handlers[e.type].forEach(handler => {
        handler(e);
      });
    }
  }
}

const TYPE = 'routerChange';
const loadUrls = [];

const ara = new AdminRouterAsync();
ara.on(TYPE, e => {
  if (loadUrls.indexOf(e.url) < 0) {
    window['addContainer'] = true;
    fetch(`${launchRouterPoint}?url=${encodeURIComponent(e.url)}`);
    loadUrls.push(e.url);
  }
});

function sendRouterChange(newUrl) {
  ara.send({
    type: TYPE,
    url: newUrl,
  });
}

window['sendRouterChange'] = sendRouterChange;
