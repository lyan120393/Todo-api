const mongoose = require('mongoose');

//因为mongoose模式使用的是callback,但是我们希望使用Node自带的promise对象,所以
mongoose.Promise = global.Promise;
//使用mongoose去连接MongoDB.
//参数就是本地的mongoDB的地址以及打算使用的数据库名称.
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/TodoApp');