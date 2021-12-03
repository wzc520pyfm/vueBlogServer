var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var {checkAPP,checkAdmin,checkUser}=require('./util/middleware')
import './'

//引入路由
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
//增加管理员路由
var adminRouter = require('./routes/admin');

//创建实例
var app = express();

// swagger
// const expressSwagger = require('express-swagger-generator')(app)
// let options = {
//     swaggerDefinition: {
//       info: {
//         description: 'This is a sample server',
//         title: 'Swagger',
//         version: '1.0.0'
//       },
//       host: 'localhost:3000',
//       basePath: '/',
//       produces: ['application/json', 'application/xml'],
//       schemes: ['http', 'https'],
//       securityDefinitions: {
//         JWT: {
//           type: 'apiKey',
//           in: 'header',
//           name: 'Authorization',
//           description: ''
//         }
//       }
//     },
//     route: {
//       url: '/swagger',
//       docs: '/swagger.json' //swagger文件 api
//     },
//     basedir: __dirname, //app absolute path
//     files: ['./controller/*.js'] //Path to the API handle folder
//   }
//   expressSwagger(options)

// swagger END

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//如果AJAX方式请求服务器,在根域名或端口不同时会产生跨域问题,可以参照如下方式解决:
//设置允许跨域访问该服务
//设置跨域访问---指定一个全局路由中间件,将所有路由都设置为允许跨域
app.all('*',function (req,res,next) {
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Headers","*");
    next();
});


//使用中间件,在本项目中所有定义的路由都应当使用该中间件
app.use('/', checkAPP,indexRouter);
app.use('/users',checkAPP, usersRouter);
app.use('/admin',[checkAPP,checkUser,checkAdmin], adminRouter);

module.exports = app;
