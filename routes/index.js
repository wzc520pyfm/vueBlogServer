var express = require('express');
var router = express.Router();

//引入处理逻辑的JavaScript文件
var {getNavMenu,getFooter,getLinks,getIndexPic,getHotArticle,getNewArticle,getArticle,getArticleTalk,getArticles,viewArticle}=require('../controller/getData')
const util=require('../util/common')

//测试路由--用于测试中间件是否生效---获取footer显示内容
// router.get('/getFooter',function(req,res,next){
//   res.json(util.getReturnData(0,'success'));
// });
//获取菜单
router.get('/getNavMenu',getNavMenu);
//footer显示内容
router.get('/getFooter',getFooter);
//获取友情链接
router.get('/getLinks',getLinks)
//获取首页轮播图片
router.get('/getIndexPic',getIndexPic)
//获取热点文章列表
router.get('/getHotArticle',getHotArticle)
//获取最新的文章列表
router.get('/getNewArticle',getNewArticle)
//获取文章的详情
router.get('/getArticle/:id',getArticle)
//获取文章评论
router.get('/getArticleTalk/:id',getArticleTalk)
//获取小标签或者文章分类的内容
router.post('/getArticles',getArticles)
//文章被查看数自动+1的API
router.get('/viewArticle/:id',viewArticle)


// 一改---1
/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

module.exports = router;
