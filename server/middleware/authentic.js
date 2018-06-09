const {User} = require('../models/User');

//因为 authentic 是一个 middleware, 所以他的参数就是 req, res, next.
let authentic = (req, res, next) => {
    let token = req.header('x-auth');
    //因为我们使用了 Statics 方法创建了 UserSchema 的数据结构,那么我们就可以通过 Model User 去接入.
    //我们就可以找到用户,前提是要判断一下用户是否是存在的.
    //如果用户存在那么就把用户的信息写在 req.user 以及 req.token 当中.
    User.findByToken(token).then((user) => {
        if (!user){
            return Promise.reject();
        }else{
            //把通过 middleware 找到的值设置到 req 当中.
            req.user = user;
            req.token = token;
            next();
        }
    }).catch((err) => {
        res.status(401).send();
    });
}

module.exports = {
    authentic,
}