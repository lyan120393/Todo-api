const jwt = require('jsonwebtoken');

let myData = {
    age : 25,
    name : 'Longyituo Yan',
    Mother : 'Long Yan',
    Father : 'Xiaolin Yan'
};

let token = jwt.sign(myData, '2333');

console.log(token);

let decoded = jwt.verify(token, '2333');
console.log(decoded);