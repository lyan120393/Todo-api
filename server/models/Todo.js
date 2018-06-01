const mongoose = require('../db/mongoose');
//创建一个Mongoose Model. 这可以让我们的数据库更有结构化.
//创建一个新的模型叫做Todo模型, 这个模型通过mongoose的model方法创建.
//mongoose.model方法接受两个参数, 第一个是模型的名称, 第二个是一个对象,对象中需要包含新模型中需要用到的属性,并且可以定义这些字段的类型.
//这个模型本质上是一个由mongoose.model方法生成的构造函数, 所以模型的首字母大写.
let Todo = mongoose.model('Todo', {
    text : {
        type : String,
    },
    completed : {
        type : Boolean
    },
    completedAt : {
        type : Number
    }
});