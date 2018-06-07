const expect = require('expect');
const request = require('supertest');


const {ObjectId} = require('mongodb');
const {app} = require('../server');
const {Todo} = require('../models/Todo');

const todos = [
    {
        _id : new ObjectId(),
        text : 'Test One'
    },{
        _id: new ObjectId(),
        text : 'Test Two'
    }
];

//使用beforeEach去帮助我们去在每次测试执行之前, 执行当中的语句.
//使用beforeEach的时候,如果aSync,去清除服务器内部的数据. 一定要有done.
//一个done作为beforeEach参数(回调函数)的参数. 另一个要在成功或者失败的时候调用done();
beforeEach((done) => {
    Todo.remove({}).then(() => {
        Todo.insertMany(todos);
        done();
    }
);
});

describe('Post /todos', () => {
    it('should create a new todo', (done => {
        //设置要准备测试的文本, 这个就是todo的text, 这个是required的,否则出错.
        let text = 'I need feed my cat';
        //使用supertest,把server app作为参数传入.
        request(app)
            //模拟以post方式访问路由/todos
            .post('/todos')
            //并模拟从用户发送了一条text的json格式的信息至服务器
            .send({text})
            //期待服务器返回一切ok的编码 200.
            .expect(200)
            //期待服务器返回的结果中的res.body.text当中包含和发送测试文本一样的文本
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            //使用.end命令结束通过supertest模拟的请求,表示结束并判断是否遇到错误
            .end((err,res) => {
                if (err){
                    //如果遇到错误, 直接return, 则下方的测试数据库的信息则不会被执行.
                    //return在这里是点睛之笔, 因为如果模拟请求发生错误, 那么数据库信息自然是无效的.
                    //使用done,如果发生错误. 必须结束aSync操作时用done.
                    return done(err);
                };
                //Todo是mongoose.model,所以Todo可以做一切操作数据库CRUD的操作.
                //通过Todo(mongoose.model)对数据库进行检查,并返回数据为整个数据库的cursor对象.
                Todo.find({text : 'I need feed my cat'}).then((todos) => {
                    //期待返回的数据库cursor对象的长度等于1
                    expect(todos.length).toBe(1);
                    //期待数据库cursor的第一个位置的document的text字段和测试字段相同.
                    expect(todos[0].text).toBe(text);
                    //使用done进行常规的aSync结束.
                    done();
                }).catch((err) =>{
                    //使用done进行返回错误. 必须使用done,因为测试的是aSync.
                    done(err);
                });
            });
    }));

    it('should pass if visitor send wrong data', (done) => {
        let text = "";
        
        request(app)
            .post('/todos')
            .send({text})
            .expect(400)
            .end((err, res) => {
                if(err){
                    return done(err);
                }

                Todo.find().then((todos) => {
                    //获取到的长度可以为0,但是不可能是undefined,如果是undefined,看看length怎么拼写的
                    expect(todos.length).toBe(2);
                    done();
                }).catch((err) => {
                    done(err);
                })
            })
    })
});

describe('Get /todos', () => {
    it('should get information from server .get /todos and database', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2);
                expect(res.body.message).toBe('This message come from res.send object');
            })
            //使用一句.end(done)当我们不需要在.end当中执行任何的aSync测试.
            .end(done);
            // 使用.end((err, res) => {})的方法,如果我们在.end当中还有aSync.
            // .end((err, res) => {
            //     if(err){
            //         return done(err);
            //     }
            //     done();
            // });
            
    })
})

describe('Get /todos/:id', () => {
    it('should pass if the object text is as same as the id we input', (done) => {

        request(app)
            //因为使用:id, 所以路由要使用字符串模版
            //使用tohexString()把ObjectID转化为字符串
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text)
            })
            .end(done);
    });

    it('Should return a 404 if the todo is not exist in database', (done) => {
        let fakeId = new ObjectId();
        request(app)
            .get(`/todos/${fakeId.toHexString()}`)
            .expect(404)
            .expect((res) => {
                expect(res.body.message).toBe('The id is not exist in Database')
            })
            .end(done);
    });

    it('Shoule return 404 if the id passed is a inValid',(done) => {
        //This is a invalid id.
        let id = '2333666';

        request(app)
            .get(`/todos/${id}`)
            .expect(404)
            .expect((res) => {
                expect(res.body.message).toBe('The id is not Valid.')
            })
            .end(done);

    })
})

describe('Delete /todos/:id', () => {
    it('expect inValid id', (done) => {
        let id = '2333666';

        request(app)
            .delete(`/todos/${id}`)
            .expect(404)
            .expect((res) => {
                expect(res.body.message).toBe('The id is not Valid.')
            })
            .end((err, res) => {
                if(err){
                    return done(err);
                }
                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((err) => {
                    done(err);
                })
            });
    });

    it('expect id not found', (done) => {
        let fakeId = new ObjectId();
        request(app)
            .delete(`/todos/${fakeId.toHexString()}`)
            .expect(404)
            .expect((res) => {
                expect(res.body.message).toBe('The id is not exist in Database')
            })
            .end(done);
    });

    it('expect delete data correct', (done) => {
        let id = todos[0]._id;

        request(app)
            .delete(`/todos/${id}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.message).toBe('has been deleted')
            })
            .end((err, res) => {
                if(err){
                    return done(err);
                }
                Todo.find().then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe('Test Two');
                    done();
                }).catch((err) => {
                    done(err);
                })
            })
    });
});