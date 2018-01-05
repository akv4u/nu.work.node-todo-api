var env = process.env.NODE_ENV || 'development';
console.log ('---------------------------');
console.log (`+  env : ${env}`);
console.log ('---------------------------');

if (env === 'development') {
  process.env.PORT = 3001;
  process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
}
else if (env === 'test') {
  process.env.PORT = 3001;
  process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';
}
