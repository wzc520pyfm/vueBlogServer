
let redis=require("../util/redisDB")
const util=require('../util/common')
const crypto=require('crypto');

//获取导航菜单--获取保存在数据库中的值
exports.getNavMenu=(req,res,next)=>{
    let key=req.headers.fapp+":nav_menu"
    //获取数据
    redis.get(key).then((data)=>{
        console.log(data)
        res.json(util.getReturnData(0,'',data))
    })
}

//获取footer相关内容
exports.getFooter=(req,res,next)=>{
    let key=req.headers.fapp+":footer"
    //获取数据
    redis.get(key).then((data)=>{
        console.log(data)
        res.json(util.getReturnData(0,'',data))
    })
}
//获取友情链接
exports.getLinks=(req,res,next)=>{
    let key=req.headers.fapp+":links"
    //获取数据
    redis.get(key).then((data)=>{
        console.log(data)
        res.json(util.getReturnData(0,'',data))
    })
}
//获取首页轮播图片的相关内容---查 
exports.getIndexPic=(req,res,next)=>{
    let key=req.headers.fapp+":indexPic"
    //获取数据
    redis.get(key).then((data)=>{
        console.log(data)
        res.json(util.getReturnData(0,'',data))
    })
}
//获取热点文章
exports.getHotArticle=(req,res,next)=>{
    let key=req.headers.fapp+":a_view"
    //获取集合,只取0,1,2,3,4五条数据
    redis.zrevrange(key,0,4).then(async(data)=>{
        console.log(data)
        let result=data.map((item)=>{
            //获取每篇文章的题目,ID及日期
            return redis.get(item.member).then((data1)=>{
                console.log(data1)
                if(data1 && data1.show!=0){
                    return {
                        'title':data1.title,
                        'date':util.getLocalDate(data1.time),
                        'id':data1.a_id,
                        'view':item.score
                    }
                }else{
                    return {'title':'文章暂未上线','date':'','id':0}
                }
            })
        })
        let t_data=await Promise.all(result)
        res.json(util.getReturnData(0,'',t_data))
    })
}
//获取最新的文章列表
exports.getNewArticle=(req,res,next)=>{
    let key=req.headers.fapp+":a_time"
    let isAdmin=false
    //获取数据
    console.log(key)
    //获取集合
    //登录用户才判断
    if('token' in req.headers){
        //如果是管理员,则应当获得所有文章
        let pKey=req.headers.fapp+":user:power:"+req.headers.token
        redis.get(pKey).then((power)=>{
            //管理员权限
            if(power=='admin'){
                redis.zrevrange(key,0,-1).then(async (data)=>{
                    let result=data.map((item)=>{
                        //获取每篇文章的题目,ID及日期
                        return redis.get(item.member).then((data1)=>{
                            console.log(data1)
                            if(data1){
                                return {'title':data1.title,'data':util.getLocalDate(item.score),'id':data1.a_id,'show':data1.show}
                            }
                        })
                    })
                    let t_data=await Promise.all(result)
                    console.log(t_data)
                    res.json(util.getReturnData(0,'',t_data))
                    
                })
            }else{
                // res.json(util.getReturnData(1, '其他权限'))
                //    其他权限暂时依旧执行普通未登录效果
                redis.zrevrange(key, 0, -1).then(async (data) => {
                    console.log(data)
                    let result = data.map((item) => {
                        //获得每一篇文章的题目和id以及日期
                        return redis.get(item.member).then((data1) => {
                            if (data1 && data1.show != 0) {
                                return {'title': data1.title, 'date': util.getLocalDate(item.score), 'id': data1.a_id}
                            } else {
                                return {'title': '文章暂未上线', 'date': '', 'id': 0}
                            }
                        })
                    })
                    let t_data = await Promise.all(result)
                    res.json(util.getReturnData(0, '', t_data))
                })
            }
        })
    }else{
        redis.zrevrange(key,0,-1).then(async(data)=>{
            console.log(data)
            let result=data.map((item)=>{
                //获取每篇文章的题目,ID及日期
                return redis.get(item.member).then((data1)=>{
                    console.log(data1)
                    if(data1&&data1.show!=0){
                        return {'title':data1.title,'date':util.getLocalDate(item.score),'id':data1.a_id}
                    }else{
                        return {'title':'文章暂未上线','date':'','id':0}
                    }
                })
            })
            let t_data=await Promise.all(result)
            res.json(util.getReturnData(0,'',t_data))
        })
    }

}
//根据ID获取文章的基本内容
exports.getArticle=(req,res,next)=>{
    //获取参数
    let key=req.headers.fapp+":article:"+req.params.id
    redis.get(key).then((data)=>{
        //console.log(data)
        //判断是否显示文章内容
        if(data){
            if(data.show==1){
                //获取文章分类详情
                redis.get(req.headers.fapp+":a_type").then((type)=>{
                    type.map((item)=>{
                        if(item.uid==data.type){
                            data.typename=item.name
                        }
                    })
                    //获取文章的阅读量
                    redis.zscore(req.headers.fapp+":a_view",key).then((view)=>{
                        console.log(view)
                        data.view=view
                        //获取文章的点赞量
                        redis.zscore(req.headers.fapp+":a_like",key).then((like)=>{
                            data.like=like
                            res.json(util.getReturnData(0,'success',data))
                        })
                    })
                })
            }else{
                res.json(util.getReturnData(403,'该文章已经被删除或者不存在'))
            }
        }else{
            res.json(util.getReturnData(404,'该文章已经被删除或者不存在'))
        }
    })
}
//获取文章评论
exports.getArticleTalk=(req,res,next)=>{
    let key=req.headers.fapp+":article:"+req.params.id+":talk"
    redis.get(key).then((data)=>{
        res.json(util.getReturnData(0,'success',data))
    })
}

//getArticles
//根据小标签或者分类获取所有的文章
exports.getArticles=(req,res,next)=>{
    let key=req.headers.fapp
    //筛选,如果是tag,则执行MD5算法
    if('tag' in req.body){
        let tKeyMd5=crypto.createHash('md5').update(req.body.tag).digest("hex")
        key=key+':tag:'+tKeyMd5
        console.log(key)
    }else if('type' in req.body){
        //如果是type,则直接使用ID
        key=key+':a_type:'+req.body.type
        console.log(key)
    }else{
        res.json(util.getReturnData(1,'数据参数错误'))
        return
    }
    redis.get(key).then(async (data)=>{
        console.log(data)
        //获取所有的数据
        let result=data.map((item)=>{
            //获取每篇文章的题目,ID及日期
            return redis.get(item).then((data1)=>{
                console.log(data1)
                if(data1 && data1.show!=0){
                    return {'title':data1.title,'date':util.getLocalDate(data1.time),'id':data1.a_id}
                }else{
                    return {'title':'文章暂未上线','date':'','id':0}
                }
            })
        })
        let t_data=await Promise.all(result)
        res.json(util.getReturnData(0,'',t_data))
    })
}
//浏览量自动加1
exports.viewArticle=(req,res,next)=>{
    let key=req.headers.fapp+":article:"+req.params.id
    redis.zincrby(req.headers.fapp+':a_view',key)
    res.json(util.getReturnData(0,'success'))
}



