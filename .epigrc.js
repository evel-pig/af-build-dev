module.exports = {
  plugins: [
    [(api, opts) => {
      console.log('rc xxx plugin opts:', opts);
      api.afterInit((opts) => {
        console.log('rc xxx api method opts:', opts);
      });
    }, { test: '123' }]
  ]
}