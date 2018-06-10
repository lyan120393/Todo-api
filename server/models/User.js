const mongoose = require('mongoose');
//Email address Validator
const validator = require('validator');
//ES6 写法. 前面的是你想修改的别名, 后面的在‘’之中的是具体的npm包名称或者文件名
// import validator from 'validator';
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

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
        let User = this;
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
    findByCredentials: function(tempEmail,tempPassword){
        let User = this;
        return new Promise((resolve, reject)=>{
            User.findOne({"email":tempEmail}).then((user) => {
            if (bcrypt.compareSync(tempPassword,user.password)){
                resolve(user);
            }}).catch((err) => {
                reject(err);
            });
        });
    },
};
//在userSchema 当中定义了一个 Middleware, 这个 Middleware 只会在  Mongoose 的 save()功能执行之前执行.
//无需任何的手动操作, 只要设置了这个 middleware, 并且绑上了 save 功能, 只要 save 工作, 这些指令就会先于 save 执行.
//function 的参数 next 是非常重要的. 不可以忘记.
UserSchema.pre('save', function(next) {
    //因为 save 方法操作的是对象的实例, 所以我们使用 this 去指定对象的实例.
    let user = this;
    //判断是否密码被修改, 如果密码没有被修改,而且我们又没有判断的话, 就会不断的把已经加密的密码进行加密,这肯定是不行的.
    //ismodified 方法就是用于,只有到密码这个字段发生了变化的时候,才会执行为真部分的代码
    if (user.isModified('password')){
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, result) => {
                //在 user 的实力当中的 password 设置为我们已经加密之后的密码.
                //之后就执行完毕了这个 middleware, 然后 save 就会执行,那么加密后的密码就被存储在了用户的 password 这个字段上.
                user.password = result;
                //一定需要 next, 如果没有,那么就卡死在这里了, 貌似 Middleware 都是这种感觉得.
                //next 一定要在里面.
                next();
            })
        })
    }else{
        //如果密码没有被修改,那么这个 middleware 就不进行任何操作 ,但是也必须使用 next 去让程序继续往下执行.
        next();
    } 
});

let User = mongoose.model('User', UserSchema );


module.exports = {
    User,
}