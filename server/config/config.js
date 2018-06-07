const env = process.env.NODE_ENV || 'development';
console.log(`ENV Model is ***** ${env}`);
//test 模式只有可能在本地进行执行, 因为服务器不会运行脚本test.
if(env === 'test'){
    //指定本地的Port号
    process.env.PORT = 3000;
    //为Test模式指定了一个测试数据库; 之所以用MONGODB_URI,是因为在服务器环境下,这个值会被替换位服务器的云数据库地址.
    process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';
    //如果在本地使用了start 进行的测试,NODE_ENV这个值就不会存在,所以就糊进入developmetn模式.
    //在Heroku服务器上, NODE_ENV这个值是存在的, 值是production. 既不是test也不是development.
    //所以我们指定的这两条if条件都不会被执行,无论是PORT还是MONGODE_URI都是服务器的环境变量提供,所以即可连接到正确的云数据库上.
}else if (env === 'development'){
    process.env.PORT = 3000;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
}