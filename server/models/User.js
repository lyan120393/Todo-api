const mongoose = require('mongoose');

let User = mongoose.model('User', {
    username : {
        required : true,
        type : String,
        minlength : 1,
        trim : true,
    },
    password : {
        required : true,
        type : String,
        minlength : 1,
        trim : true,
    }
});
module.exports = {
    User,
}