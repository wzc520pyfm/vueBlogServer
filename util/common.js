//存放通用的方法或验证内容

let util={}
util.getReturnData=(code,message='',data=[])=>{
    //保证数据格式
    if(!data){
        data=[]
    }
    return {code:code,message:message,data:data}
}

//转化为格式化时间
util.getLocalDate=(t)=>{
    let date=new Date(parseInt(t))
    return date.getFullYear()+"-"+(parseInt(date.getMonth())+1)+"-"
    +date.getDate()+" "+date.getHours()+':'+date.getMinutes()+':'
    +date.getSeconds();
}

module.exports=util

