// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp',{ useNewUrlParser: true } , (err, client) => {
    if (err) {
        return console.log('Cannot connect Database');
    }
    console.log('Database has been connected');
    const db = client.db('TodoApp');
//db.collection 只接受一个参数, 用来存储新创建的collection的名称. 
//使用.insertOne进行插入一个document. 这里是一个对象.
//.insertOne 接受两个参数, 第一个是要插入的document信息, 第二个是一个回调函数用来回报成功与否和返回结果.
    db.collection('Users').insertMany([{
        name : 'TuenLi',
        age : 22,
    },{
        name : 'fengfan',
        age : 99,
    },{
        name : 'James',
        age : 21
    }], (err, result) => {
        if (err) {
            return console.log(`Cannot insert Data in DataBase: ${err}`)
        }
        //使用result.ops可以返回本次添加的数据
        console.log(`Data has been insert to DataBase: ${JSON.stringify(result.ops, undefined, 2)}`);
    });


    client.close();
});