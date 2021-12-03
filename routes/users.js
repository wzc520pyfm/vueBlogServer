var express = require('express');
var router = express.Router();
//引入处理逻辑的JavaScript文件
var {userLogin,userRegister}=require('../controller/user')
var {checkUser}=require('../util/middleware')


/* GET users listing. */
router.post('/login',userLogin);
router.post('/register',userRegister);

router.use('/user',checkUser,require('./userNeedCheck'))

module.exports = router;

