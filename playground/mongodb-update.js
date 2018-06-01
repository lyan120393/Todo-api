const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp',{ useNewUrlParser: true } , (err, client) => {
    if (err) {
        return console.log('Cannot connect Database');
    }
    console.log('Database has been connected');
    const db = client.db('TodoApp');

    //findOneAndUpdate接受三个参数
    //第一个参数是需要修改的值, 这个实际是一个filter,用来确认我们要去修改哪一个具体.
    //第二个参数是修改的内容, 这里需要使用 MongoDB Update Operator,我们使用了$set 和 $inc, 这两个都是需要被放置在一个对象当中.
    //第三个参数, 也就是Option参数, 默认findOneAndUpdate将会返回一个result, 这个result是修改前的结果, 如果我们需要得到修改后的结果, 需要用一个对象, 并且设置returnOriginal:false即可.、
    //第三个参数只是影响findOneAndUpdate的返回的内容,真正的数据已经被修改为最新的了.
    db.collection('Users').findOneAndUpdate({
        _id : new ObjectID('5b1046b9d4e679f18f2b16a5')
    }, {
        $set : {
            name : 'James',
        },
        $inc : {
            age : 1,
        }
    }, {
        returnOriginal : true,
    }).then((result) => {
        console.log(`Has been Updated ${JSON.stringify(result, undefined, 2)}`);
    }).catch((err) => {
        if (err) {
            console.log(`there is a problem: ${err}`)
        }
    });

    client.close();
});