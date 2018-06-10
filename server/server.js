require('./config/config');
//Load library
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const validator = require('validator');
//Load database configration, Use desctrucuring
const {ObjectId} = require('mongodb');
const {mongoose} = require('./db/mongoose');
//Load models Use desctrucuring
const {Todo} = require('./models/Todo');
const {User} = require('./models/User');
const {authentic} = require('./middleware/authentic');
const bcrypt = require('bcryptjs');

const port = process.env.PORT
const app = express();
//之前只是载入了bodyParser,这次是进行注册它位中间件MiddleWare.
//使用MiddleWare去保持检测req.header当中的content-type为json的文件,并把json格式转化为object对象,同时转化好的body.object对象包含到req.body当中.
app.use(bodyParser.json());

//设置http的Handler为处理post请求, 路由为/todos,并执行回调函数创建一个新的todo Obejct.
app.post('/todos', (req, res) => {
    //通过mongoose model的构造函数生成新的Object.
    let todo = new Todo({
        //直接获取用户发送过来的信息当中的text属性.
        //如果需要获取多个用户上传的属性, 我们需要使用lodash的pick功能.参照app.patch
        text : req.body.text
    });
    //进行save的时候,使用的是Todo的实例todo
    todo.save().then((doc) => {
        //通过res.send去返回存入之后的新的结果,前提是成功了;
        res.send(doc);
    }).catch((err) => {
        //如果产生错误, 设置res.statusCode为400.bad request, client的请求错误代码,然后并返回错误e.
        res.status(400).send(err);
    })
});

app.get('/todos', (req, res) => {
    //通过mongoose的model去查找数据库内的所有信息
    //进行查找的时候使用的是Todo mongoose model对象.
    Todo.find({}).then((todos) => {
        //如果成功则返回,一定要返回一个对象, 因为todos本身只是一个数组,而对象除了能够包含这个数组,还能够包含其他我们想发送给访问着的内容
        res.send({
            todos,
            message : 'This message come from res.send object'
        })
    }).catch((err) => {
        res.status(400).send(err);
    })
    
})
//Get a individual resources; Get /todos/:id
//通过这个id可以把用户输入的相同字段位置的信息,通过req.params.id得到,然后存入到id中.
//举例,用户如果输入 localhost:3000/todos/2333666 , 2333666就会被req.params.id取得,并存入到id当中
app.get('/todos/:id', (req, res) => {
    let id = req.params.id;
    //使用objectid的isvalid方法判断id是否是一个合法的id
    if (!ObjectId.isValid(id)){
        res
        .status(404)
        .send({message : 'The id is not Valid.'});
    }else{
        //如果id合法,那么检测是否数据当中包含这个id
        Todo.findById(id).then((todo) => {
            if(todo){
                res.send({todo});
            }else{
                //如果不包含, 那么输出错误信息, 并返回404.
                res
                    //status(404)必须在.send之前, 因为.send就已经把数据发出去了, 此时的404就不会被传递给用户,就会产生虽然出错,但是状态码依然是404.
                    .status(404)
                    .send({message:'The id is not exist in Database'});
            }
    })
}});

app.delete('/todos/:id', (req, res) => {
    //获取用户上传的id参数
    let id = req.params.id;
    //判断id的格式是否合法
    if (!ObjectId.isValid(id)){
        res
        .status(404)
        .send({message : 'The id is not Valid.'});
    }else{
        //如果id合法,那么检测是否数据当中包含这个id
        Todo.findById(id).then((todo) => {
            if(todo){
                //使用findByIdAndRemove方法删除指定的id对象.
                //todo是我们通过ID找到的那一条,然后通过他自身的id进行删除.
                Todo.findByIdAndRemove(todo._id).then(() => {
                    res
                        .status(200)
                        .send({
                        todo,
                        message: `has been deleted`
                    });
                }).catch((err) => res.send(err));
            }else{
                //如果不包含, 那么输出错误信息, 并返回404.
                res
                    //status(404)必须在.send之前, 因为.send就已经把数据发出去了, 此时的404就不会被传递给用户,就会产生虽然出错,但是状态码依然是404.
                    .status(404)
                    .send({message:'The id is not exist in Database'});
            };
    });
};
});

app.patch('/todos/:id', (req, res) => {
    let id = req.params.id;
    //监测id是否合法
    if (!ObjectId.isValid(id)){
        res
        .status(404)
        .send({message : 'The id is not Valid.'});
    }else{
        //使用_.pick方法从用户提交的内容中查找completed属性对应的字段.
        //并且把结果存储在这个body当中.
        let body = _.pick(req.body,['completed']);
        
        //检测completed字段是否是一个布尔值,并且是否为真(已完成)
        if(_.isBoolean(body.completed) && body.completed){
            //把完成的时间设置为一个时间戳.
            body.completedAt = new Date().getTime();
        } else{
            body.completedAt = null;
            body.completed = false;
        };

        //开始真正的更新操作
        //使用update operator操作,设置对象的所有属性为body的属性,通过{$set:body}.
        //{new:true}, 如果new的属性位True,那么返回我们修改后的document,默认是false即返回原始对象.
        Todo.findByIdAndUpdate(id, {$set: body},{new: true}).then((todo) => {
            if(!todo){
                return res.status(404).send({message: 'Cannot to find id in database'});
            }
            res.send(todo);
        }).catch((err) => {
            res
            .status(404)
            .send({message: 'Cannot to find id in database'})
        });


}});

//用户创建路由
app.post('/user', (req, res) => {
    //通过lodash的pick获取用户输入的指定内容
    //通过pick获取的指定内容, 通过User构造函数创建一个新的用户object.
    let tempUser = _.pick(req.body, ['email', 'password']);
    //因为tempUser通过_.pick已经给我们返回了一个Obj, 所以直接把Obj作为new User的参数即可.
    let user = new User(tempUser);
    // let user = new User({
    //     email : tempUser.email,
    //     password : tempUser.password
    // });
    //验证email是否是valid通过validator.isEmail();
    if (validator.isEmail(user.email)){
        //通过User Model去查找数据库,
    User.find({'email':user.email}).then((users) => {
        if (users.length){
            return res.status(400).send("The E-mail already exist, please try another one");
        }
        //使用user实例去进行存储.此时进行存储用户的信息进入数据库。
        user.save().then(() => {
            //返回得到的结果， 这个返回值就是返回一个token。
            //user是什么？ user是实例，user是model User的实例。
            //使用UserSchema.method给实例添加方法，所以我们可以通过实例去操作，因为只有实例才具有_id属性。
            return user.generateAuthToken();
        }).then((token) => {
            //获取返回的token，并且成功返回了token。
            //然后就把token的结果返回到header当中的x-auth字段当中。（x-auth是一个自定的header字段， 两个参数，一个是键名，另一个是值。）
            //然后通过res.header()方法把包含了token的头信息发送给用户。
            res.header('x-auth', token).send({
                //使用定义好的toJson()方法过滤信息，只把用户的id和email发送回给用户。
                //toJson()方法是在UserSchema当中进行定义的。 
                //再次重申！！ _.pick方法能操作的是对象，不能是mongoose.model的实例对象。
                user: user.toJson()
            });
        }).catch((err) => {
            res.status(400).send({err, message:'捕获错误', user});
        });
        })
    }else{
        res.status(400).send('The email is not a valid email');
    };
});

app.get('/user/me', authentic, (req, res) => {
    res.send(req.user.toJson());
});

app.post('/user/login', (req, res) => {
    let tempUser = _.pick(req.body, ['email', 'password']);
    //打开电脑,看到这句话,  马上要学习的就是根据用户输入的 email 和密码去查找指定的用户. 这个功能会被写在 UserSchema 的 Static 当中.
    User.findByCredentials(tempUser.email, tempUser.password).then((user) => {
        //如果找到了用户, 那么立刻生成一个新的 token 并返回给用户.
        return user.generateAuthToken().then((token) => {
            res.header('x-auth',token).send(user.toJson())
        });
    }).catch((err) => {
        res.status(400).send({
            err,
            message: 'Cannot Find user in Database.',
        })
    })
});

app.delete('/user/me/token', authentic, (req, res) => {
    //使用 removeByToken 去删除tokens 当中的 token 数组.
    req.user.removeByToken(req.token).then(() => {
        res.send({message : 'Token has been Remove and User logOut successful.'})
    }).catch((err) => {
        res.status(400).send(err);
    })
})

app.listen(port, () => {
    console.log(`Server is turn on at ${port} port.`);
});

module.exports = {
    app,
};