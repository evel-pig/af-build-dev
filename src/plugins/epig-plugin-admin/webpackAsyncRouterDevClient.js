const handlers = {};
const launchRouterPoint = require('./launchRouterPoint');

class AdminRouterAsync {
  on(type, handler) {
    if (!handlers[type]) {
      handlers[type] = [];
    }
    handlers[type].push(handler);
  }

  send(e) {
    if (handlers[e.type]) {
      handlers[e.type].forEach(handler => {
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
    window.addContainer = true;
    fetch(`${launchRouterPoint}?url=${window.encodeURIComponent(e.url)}`);
    loadUrls.push(e.url);
  }
});

function sendRouterChange(newUrl) {
  ara.send({
    type: TYPE,
    url: newUrl,
  });
}

window.sendRouterChange = sendRouterChange;
