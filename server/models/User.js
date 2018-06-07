const mongoose = require('mongoose');
//Email address Validator
const validator = require('validator');
//ES6 写法. 前面的是你想修改的别名, 后面的在‘’之中的是具体的npm包名称或者文件名
// import validator from 'validator';
const jwt = require('jsonwebtoken');

let UserSchema = new mongoose.Schema(
    {
        email : {
            required : true,
            type : String,
            minlength : 1,
            trim : true,
            //unique用于去进行验证是否个该e-mail在整个的collection中唯一.
            unique :true,
            //validate对象接受两个属性, 第一个是验证的validator,另一个是message.
            validate:{
                //validator不需要在.usEmail后面加参数, 因为mongoose会自当帮我们处理.
                validator: validator.isEmail,
                message: '{VALUE} is not a valid email'
            }
        },
        password : {
            required : true,
            type : String,
            minlength : 6,
            trim : true,
        },
        //tokens是一个数组, 数组包含着对象.
        //每个对象都是一个object, 并且每个对象都有access 和 token属性.
        //tokens用于验证用户访问的不同设备.
        tokens : [{
            access : {
                type : String,
                required : false
            },
            token : {
                type : String,
                required : false
                }
        }]
    }
);

UserSchema.method = {
    generateAuthToken: function() {
        //this指代的是通过UserSchama创建的UserModel的user实例.
        this.access = 'auth';
        this.token = jwt.sign({_id: this._id.toHexString(), access: this.access}, 'abc123').toString();

        user.tokens.push({access,token});
    },
    // findByToken: function() {}
}

let User = mongoose.model('User', UserSchema );


module.exports = {
    User,
}