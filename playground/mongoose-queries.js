const {mongoose} = require('./../server/db/mongoose');
const {ObjectId} = require('mongodb');

const {User} = require('./../server/models/User');

const id = '5b119f094de5751c26c2f05622';

if(!ObjectId.isValid(id)){
    return console.log(`Id is not valid`)
}
User.find({username: 'yl@gmail.com'}).then((users) => {
    console.log(users);
})

User.findOne({
    _id: id,
}).then((user) => {
    console.log(user);
});

User.findById(id).then((user) => {
    console.log(user);
});



