const mongoose = require('mongoose');
//Email address Validator
const validator = require('validator');
//ES6 写法. 前面的是你想修改的别名, 后面的在‘’之中的是具体的npm包名称或者文件名
// import validator from 'validator';
const jwt = require('jsonwebtoken');
const _ = require('lodash');

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

UserSchema.methods = {
    generateAuthToken: function() {
        //使用this指代的是user的实例，这句话可以避免我们困惑。
        let user = this;
        //也就是说，通过如下的语句，我们可以创建access和token这两个值。
        let access = 'auth';
        let token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();

        //因为user实例的tokens属性是一个数组，所以我们可以使用数组的push方法，把增加的对象增加到数组的最后面。
        user.tokens.push({access,token});
            // user.tokens = user.tokens.concat([{access, token}]);  //如果出现问题使用这个进行尝试。

        //进行存储tokes当中的数值
        //这个return返回的就是： 当user.save成功操作之后， 我们会得到token。并且把token作为这个功能的返回值。
        //因为我们进行了return， 所以我们可以再server.js当中对这个结果再次进行链式then的操作。
        return user.save().then(() => token);
    },
    //使用toJson功能，把mongoose.model的实例对象user转化为Javascript的对象，然后再通过_.pick方法去操作对象，并获取指定键值。
    toJson: function(){
        let user = this;
        //把mongoose对象转化为JavaScript标准对象。
        let userObject = user.toObject();
        //通过_pick方法从对象当中提取键值。
        return _.pick(userObject, ['_id', 'email']);
    },
    // findByToken: function() {}
};

UserSchema.statics={
    findByToken: function(token){
        let decode;
        try {
            decode = jwt.verify(token, 'abc123');
        } catch (error) {
            return Promise.reject('Cannot Verify token');
        };
        //上方的 try&catch 使用了 return, 如果一旦出现错误, 那么下方的 return 内容将会被直接跳过.
        return User.findOne({
            '_id':decode._id,
            'tokens.token':token,
            'tokens.access':'auth',
        })
    },
};

let User = mongoose.model('User', UserSchema );


module.exports = {
    User,
}