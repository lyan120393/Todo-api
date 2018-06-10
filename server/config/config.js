const env = process.env.NODE_ENV || 'development';

if (env === 'development' || env === 'test'){
    //读取当前目录中的另一个叫做 config.json 的文件.
    let config = require('./config.json');
    //通过 config[env] 根据 env 的值去选择读取 config.json 文件当中的 test 的属性值或者 development 的属性值.
    //重点!! 当想去通过变量去接入属性名称, 必须要用方括号.
    let envConfig = config[env];

    //Object.keys()方法可以把一个 Object 当中的所有属性名称拿出来变成一个数组.
    //通过数组的 foreach 方法,分别取接入每一个属性名称, 从而获得属性的值, 然后进行设置.
    //实例: 运行之后会输出['PORT', 'MONGODB_URI'], 这俩名字就会成为 key 所代表的值.
    Object.keys(envConfig). forEach((key) => {
        //设置 process.env 中的[key]对应的属性名为 envConfig 当中对应的属性名[key].
        //重点!! 当想去通过变量去接入属性名称, 必须要用方括号.
        process.env[key] = envConfig[key];
    })
}

// The Old One for Local Server Environment Variable.

// console.log(`ENV Model is ***** ${env}`);
// //test 模式只有可能在本地进行执行, 因为服务器不会运行脚本test.
// if(env === 'test'){
//     //指定本地的Port号
//     process.env.PORT = 3000;
//     //为Test模式指定了一个测试数据库; 之所以用MONGODB_URI,是因为在服务器环境下,这个值会被替换位服务器的云数据库地址.
//     process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';
//     //如果在本地使用了start 进行的测试,NODE_ENV这个值就不会存在,所以就糊进入developmetn模式.
//     //在Heroku服务器上, NODE_ENV这个值是存在的, 值是production. 既不是test也不是development.
//     //所以我们指定的这两条if条件都不会被执行,无论是PORT还是MONGODE_URI都是服务器的环境变量提供,所以即可连接到正确的云数据库上.
// }else if (env === 'development'){
//     process.env.PORT = 3000;
//     process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
// }