const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp',{ useNewUrlParser: true } , (err, client) => {
    if (err) {
        return console.log('Cannot connect Database');
    }
    console.log('Database has been connected');
    const db = client.db('TodoApp');
//通过db.collection('Todos')确定要进行查找的collection
//通过find()确定我们的任务是进行查找
//通过toArray把返回的结果转化为array
//toArray返回的是一个Promise对象,  使用then去操作成功时,使用Catch去操作失败时的结果.
    // db.collection('Todos').find({_id : new ObjectID('5b103e43f6bbeaefc49a11a4')}).toArray().then((docs) => {
    //     console.log(JSON.stringify(docs, undefined, 2))
    // }).catch((err) => {
    //     if (err){
    //         console.log(`Cannot fetch data from Database: ${err}`);
    //     };
    // });
    db.collection('Users').find({name : 'James'}).toArray().then((docs) => {
        console.log(`The index of James in User database is ${JSON.stringify(docs, undefined, 2)}`);
    }).catch((err) => {
        console.log(`Cannot find James in Users Collection`);
    })


    client.close();
});