//Load library
const express = require('express');
const bodyParser = require('body-parser');
//Load database configration, Use desctrucuring
const {mongoose} = require('./db/mongoose');
//Load models Use desctrucuring
const {Todo} = require('./models/Todo');
const {User} = require('./models/User');

let app = express();
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

let isa = new Todo({
    text : 'Happy',
})

isa.save();

app.listen(3000, () => {
    console.log('Server is turn on at 3000 port.');
})





