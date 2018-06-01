const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp',{ useNewUrlParser: true } , (err, client) => {
    if (err) {
        return console.log('Cannot connect Database');
    }
    console.log('Database has been connected');
    const db = client.db('TodoApp');

    //deleteMany();
    db.collection('Users').deleteMany({name:'Longyituo Yan'}).then((result) => {
        console.log(`All name equal to Longyituo Yan has been removed. ${result}`)
    }).catch((err) => {
        console.log(`Cannot remove Longyituo Yan from Database`);
    })
    //deleteOne();

    //findOneAndDelete();
    db.collection('Users').findOneAndDelete({
        _id : new ObjectID('5b1046b9d4e679f18f2b16a6')
    }).then((result) => {
        console.log(`Jame has been removed by ID`)
    }).catch((err) => {
        console.log(`James cannot been removed by ID`);
    });

    client.close();
});