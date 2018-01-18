var env = process.env.NODE_ENV || 'development';
console.log ('---------------------------');
console.log (`+  env : ${env}`);
console.log ('---------------------------');

if (env === 'development' || env === 'test') {
  let config = require('./config.json');
  let envConfig = config[env];
  Object.keys(envConfig).forEach((key) => {
    process.env[key] = envConfig[key];
  });
}
