let redis=require('../util/redisDB')
const util=require('../util/common')
const crypto=require('crypto')



//文章评论
exports.articleTalk=(req,res,next)=>{
    if('a_id' in req.body && 'talk' in req.body){
        //组织字符串
        let talk={talk:req.body.talk,time:Date.now(),username:req.username}
        let key=req.headers.fapp+':article:'+req.body.a_id+':talk'
        redis.get(key).then((data)=>{
            let tData=[]
            console.log(Date(talk.time))
            if(data){
                tData=data
                tData.push(talk)
            }else{
                tData.push(talk)
            }
            redis.set(key,tData)
            res.json(util.getReturnData(0,'评论成功'))
        })
    }else{
        res.json(util.getReturnData(1,'评论错误'))
    }
}

//获取用户资料,不包含密码
exports.getUserInfo=(req,res,next)=>{
    //获取用户资料存在两种情况,一种是自己的资料,一种是他人的资料
    redis.get(req.headers.fapp+":user:info:"+req.params.username).then((data)=>{
        if(data){
            if(req.params.username==req.username){
                //自己的资料
                delete data.password
            }else{
                //他人的资料,通过username查找
                delete data.phone
                delete data.password
            }
            res.json(util.getReturnData(0,'',data))
        }else{
            res.json(util.getReturnData(1,'用户不存在'))
        }
    })
}
//修改用户资料
exports.changeUserInfo=(req,res,next)=>{
    let key=req.headers.fapp+":user:info:"+req.username
    redis.get(key).then((data)=>{
        if(data){
            let userData={
                username:req.username,
                phone:'phone' in req.body ? req.body.phone : data.phone,
                nikename:'nikename' in req.body ? req.body.nikename : data.nikename,
                age:'age' in req.body ? req.body.age : data.age,
                sex:'phone' in req.body ? req.body.sex : data.sex,
                password:'password' in req.body ?req.body.password : data.password,
                //用户是否被封停
                login:data.login
            }
            redis.set(key,userData)
            res.json(util.getReturnData(0,'修改成功'))
        }else{
            res.json(util.getReturnData(1,'修改失败'))
        }
    })
}

//发送私信
exports.sendMail=(req,res,next)=>{
    let checkKey=req.headers.fapp+":user:info:"+req.params.username
    //验证用户是否存在
    redis.get(checkKey).then((user)=>{
        console.log(checkKey)
        console.log(user)
        if(user && req.body.text){
            let userKey1=req.headers.fapp+':user:'+req.username+':mail'
            let userKey2=req.headers.fapp+':user:'+req.params.username+':mail'
            let mailKey=req.headers.fapp+':mail'
            //保证两个用户之间只可能出现一次对话
            redis.get(userKey1).then((mail)=>{
                if(!mail) mail=[]
                let has=false
                for(let i=0;i<mail.length;i++){
                    if(mail[i].users.indexOf(req.params.username)>-1){
                        has=true
                        //对话已经存在,直接写
                        mailKey=mailKey+mail[i].m_id
                        redis.get(mailKey).then((mailData=[])=>{
                            mailData.push({text:req.body.text,time:Date.now(),read:[]})
                            redis.set(mailKey,mailData)
                            res.json(util.getReturnData(0,'发送私信成功'))
                            next()
                        })
                    }
                }
                if(!has){
                    //新对话,需获取唯一ID
                    redis.incr(mailKey).then((m_id)=>{
                        mailKey=mailKey+m_id
                        redis.set(mailKey,[{text:req.body.text,time:Date.now(),read:[]}])
                        //更新用户的私信列表数据库
                        console.log({users:[req.params.username]})
                        mail.push({m_id:m_id,users:[req.username,req.params.username]})
                        redis.set(userKey1,mail)
                        //写第二个用户
                        redis.get(userKey2).then((mail2)=>{
                            if(!mail2) mail2=[]
                            mail2.push({m_id:m_id,users:[req.username,req.params.username]})
                            redis.set(userKey2,mail2)
                            res.json(util.getReturnData(0,'发送新私信成功'))
                        })
                    })
                }
            })
        }else{
            res.json(util.getReturnData(1,'用户不存在,发送失败'))
        }
    })
}

//获取私信列表
exports.getMails=(req,res,next)=>{
    let userKey1=req.headers.fapp+':user:'+req.username+':mail'
    redis.get(userKey1).then((mail)=>{
        res.json(util.getReturnData(0,'',mail))
    })
}

//获取私信内容
exports.getUserMail=(req,res,next)=>{
    let userKey1=req.headers.fapp+':user:'+req.username+':mail'
    let rData={}
    redis.get(userKey1).then((mail)=>{
        if(!mail) res.json(util.getReturnData(0,'',[]))
        let has=false
        //获取内容
        for(let i=0;i<mail.length;i++){
            if(mail[i].m_id==req.params.id){
                has=true
                //删除自己的数据
                mail[i].users.splice(mail[i].users.indexOf(req.username),1)
                rData.toUser=mail[i].users[0]
                let key=req.headers.fapp+':mail:'+req.params.id
                redis.get(key).then((data)=>{
                    //将自己的username写入read属性,代表已读
                    console.log(data)
                    if(data[data.length-1].read.indexOf(req.username)<0){
                        data[data.length-1].read.push(req.username)
                    }
            //构造返回内容
                    rData.mail=data
                    redis.set(key,data)
                    res.json(util.getReturnData(0,'',rData))
                    next()
                })
                break;
            }
        }
        if(!has){
            res.json(util.getReturnData(1,'请求错误'))
        }
    })
}

//获取所有文章分类
exports.getArticleType=(req,res,next)=>{
    redis.get("book:a_type").then((data)=>{
        res.json(util.getReturnData(0,'',data))
    })
}

//文章"点赞"或"踩"
exports.articleLike=(req,res,next)=>{
    let member=req.headers.fapp+":article:"+req.params.id
    let like=req.params.like
    if(like==0){
        //自减操作
        redis.zincrby(req.headers.fapp+":a_like",member,-1)
    }else{
        //自增操作
        redis.zincrby(req.headers.fapp+":a_like",member)
    }
    res.json(util.getReturnData(0,'success'))
}

//文章收藏
exports.articleCollection=(req,res,next)=>{
    let key=req.headers.fapp+":user:"+req.username+":collection"
    //获取参数
    let a_key=req.headers.fapp+":article:"+req.params.id
    redis.get(a_key).then((data)=>{
        if(data){
            //获取原本存在于数据库中的用户数据,并传入tData
            redis.get(key).then((tData)=>{
                if(!tData) tData=[]
                for(it of tData){
                    if(data.title == it.title) 
                        res.json(util.getReturnData(1,'已收藏'))
                }
                //将要新增的数据压入临时数据tData
                tData.push({item:Date.now(),a_id:req.params.id,
                title:data.title})
                //重新设置原本数据库中的数据(新设数据是tData)
                redis.set(key,tData)
                //为前端返回操作信息
                res.json(util.getReturnData(0,'success'))
            })
        }else{
            res.json(util.getReturnData(1,'文章不存在'))
        }
    })
}
//获取收藏地址
exports.getCollection=(req,res,next)=>{
    let key=req.headers.fapp+":user:"+req.username+":collection"
    redis.get(key).then((data)=>{
        console.log("看这里"+data);
        res.json(util.getReturnData(0,'',data))
    })
}



