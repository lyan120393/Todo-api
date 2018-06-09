const bcrypt = require('bcryptjs');

//用户的明文密码,可以通过 bcrypt 进行加盐,生成一个10位的随机盐.

// bcrypt.genSalt(10, (err, salt) => {
//     //通过 hash 方法对明文密码进行加密, 加盐,以及一个回调函数返回加密过后的密码.
//     bcrypt.hash(plainPassword, salt, (err, hash) => {
//         console.log(hash);
//     });
// });
let plainPassword = 'tuotuo1234'
let hashpassword = '$2a$10$RAqFijqu8U4JsQhWf1ZMLuAvu7Blxt4bdwJcM7ghU.V5byfPzTPh.';
//compare 方法接收三个参数, 第一个是明文密码, 第二个是数据库中存储的 hashpassword, 第三个是一个回调函数,又来返回 true 或者 false.
bcrypt.compare(plainPassword, hashpassword, (err, result) => console.log(result) );