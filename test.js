const Service = require('./lib/Service').default;

const service = new Service();

service.run();

console.log('');
console.log('----- log -----');
console.log('');
console.log('service pluginMethods:', service.pluginMethods);
console.log('service pluginHooks:', service.pluginHooks);
console.log('service plugins:', service.plugins);
console.log('service config:', service.config);