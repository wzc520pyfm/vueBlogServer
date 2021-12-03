// var express = require('express');
// var app = express();
// const expressSwagger = require('express-swagger-generator')(app)
let options = {
    swaggerDefinition: {
      info: {
        description: 'This is a sample server',
        title: 'Swagger',
        version: '1.0.0'
      },
      host: 'localhost:3000',
      basePath: '/',
      produces: ['application/json', 'application/xml'],
      schemes: ['http', 'https'],
      securityDefinitions: {
        JWT: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
          description: ''
        }
      }
    },
    route: {
      url: '/swagger',
      docs: '/swagger.json' //swagger文件 api
    },
    basedir: __dirname, //app absolute path
    files: ['./router/api/*.js'] //Path to the API handle folder
  }
  modules.exports=options
//   expressSwagger(options)
