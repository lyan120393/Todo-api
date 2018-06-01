const mongoose = require('../db/mongoose');

let User = mongoose.model('User', {
    username : {
        // required : true,
        type : String,
        minlength : 1,
        trim : true,
        default : 'yanlongyituo@gmail.com'
    },
    password : {
        required : true,
        type : String,
        minlength : 1,
        trim : true,
    }
});