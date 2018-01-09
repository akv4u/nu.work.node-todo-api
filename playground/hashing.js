const {AES} = require("crypto-js/aes");
const {SHA256} = require ('crypto-js');
const jwt = require ('jsonwebtoken');

//
//
// // hashing is a one way algorthim
// var message = "This is user # 2";
// var hash = SHA256(message).toString();
//
// console.log (`message: ${message}`);
// console.log (`hash: ${hash}`);
//
// var data = {
//   id: 4
// };
//
//
// var salt = 'some secret';
// var no_salt = '';
// var token = {
//   data,
//   hash: SHA256(JSON.stringify(data) + salt).toString()
// }
//
// token.data.id = 5;
// token.hash = SHA256(JSON.stringify(data)).toString();
//
// var resultHash = SHA256(JSON.stringify(token.data) + salt).toString();
//
// if (resultHash === token.hash) {
//   console.log ('data was not changed');
// }
// else {
//   console.log ('data was changed');
// }

var data = {
  id: 10
};

var token = jwt.sign(data, '123abc');

console.log(data);
console.log(`token: ${token}`);


var decoded = jwt.verify(token+1, '123abc');
console.log (decoded);
