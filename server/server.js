//Load library
const express = require('express');
const bodyParser = require('body-parser');
//Load database configration, Use desctrucuring
const {ObjectId} = require('mongodb');
const {mongoose} = require('./db/mongoose');
//Load models Use desctrucuring
const {Todo} = require('./models/Todo');
const {User} = require('./models/User');

const port = process.env.PORT || 3000;
const app = express();
//之前只是载入了bodyParser,这次是进行注册它位中间件MiddleWare.
//使用MiddleWare去保持检测req.header当中的content-type为json的文件,并把json格式转化为object对象,同时转化好的body.object对象包含到req.body当中.
app.use(bodyParser.json());

//设置http的Handler为处理post请求, 路由为/todos,并执行回调函数创建一个新的todo Obejct.
app.post('/todos', (req, res) => {
    let todo = new Todo({
        text : req.body.text
    });

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

app.listen(port, () => {
    console.log(`Server is turn on at ${port} port.`);
})

module.exports = {
    app,
}



