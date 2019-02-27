module.exports = function (pluginApi) {
  pluginApi.register('beforeServerWithApp', ({ args, opts }) => {
    console.log('args:', args);
    console.log('opts:', opts);
  });
}