//


var express=require('express');
var router=express.Router();
//引入处理逻辑的JavaScript文件
var {setNavMenu,setFooter,setLinks,setIndexPic,setArticle,showArticle,setArticleType,getAllUser,stopLogin,changeIndexPic,pushIndexPic}=require('../controller/admin')



//修改导航菜单
router.post('/changeNav',setNavMenu);

//底部内容修改
router.post('/setFooter',setFooter);

//友情链接
router.post('/setLinks',setLinks);

//修改首页轮播图片
router.post('/setIndexPic',setIndexPic)

//设置首页轮播图
router.post('/changeIndexPic',changeIndexPic)

//新增首页轮播图片
router.post('/pushIndexPic',pushIndexPic)
//发布文章
router.post('/setArticle',setArticle)

//文章的发布和删除
router.post('/showArticle',showArticle)
//分类的发布
router.post('/setArticleType',setArticleType)
//获取所有的用户
router.get('/getAllUser',getAllUser)
//用户封停操作
router.get('/stopLogin/:id',stopLogin)


module.exports=router;


