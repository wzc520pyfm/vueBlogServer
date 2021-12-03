//用户状态判定
let redis = require("../util/redisDB")//引入数据库连接文件

const {ALLOW_APP}=require('../config/app')

const util=require('./common')
//中间件定义---检查请求来源
exports.checkAPP=(req,res,next)=>{
    // console.log(req.headers)
    // if(!ALLOW_APP.includes(req.headers.fapp)){
    //     res.json(util.getReturnData(500,"来源不正确"))
    // }else{
    //     next()
    // }
    next()
}

//中间件定义--检查用户状态
exports.checkUser=(req,res,next)=>{
    console.log("检查用户登录情况")
    if('token' in req.headers){
        let key=req.headers.fapp+":user:token:"+req.headers.token
        redis.get(key).then((data)=>{
            if(data){
                //保存用户名称
                req.username=data.username
                next()
            }else{
                //key值错误或登录过期已经被删除
                res.json(util.getReturnData(403,"登录已过期,请重新登录"))
            }
        })
    }else{
        res.json(util.getReturnData(403,"请登录"))
    }
}


//中间件定义--检查是否是管理员
exports.checkAdmin=(req,res,next)=>{
    console.log("检查管理员用户")
    if(req.username=='admin'){
        //如果是管理员,则在Redis中增加一个power
        let key=req.headers.fapp+":user:power:"+req.headers.token
        redis.set(key,'admin')
        next()
    }else{
        res.json(util.getReturnData(403,"权限不足"))
    }
}