"use strict";

/*
  名称：星云心愿贴纸墙 
  项目编号：No. 2 
  版本：1.0 代码地址：https://gitee.com/JacobDota/nas_wish_wall
  描述：
  * 基于ruby on rails和星云链技术，账户信息存在mysql，钱包地址和内容存在星云链。
  * 用户可以通过名字和钱包地址创建唯一账户，在贴纸墙上发布心愿。
  我的星云:
  * 去年12月刚入币圈，遇到大熊市，又碰到了期货，破产了，想回本去银行贷款，结果又亏完。
  * 5月底需要一次性偿还银行贷款30w，现在只有10万块钱的NAS，不知道如何面对.....
  我的心愿：
  * 走一步算一步吧，首先好好做好本职工作，并且好好学习星云链开发，希望自己能撑住，也希望能出现奇迹.
  * 星云主网钱包：）n1G8N6sK6h1yAmwR9zXRv89nXAr1UGdmwoA
 */


var WishWall = function () {
  LocalContractStorage.defineMapProperty(this, "wish");
}

WishWall.prototype = {
  init: function () {
  },

  save: function (content) {

    content = content.trim();

    if (isEmpty(content)){
      throw new Error("内容不能为空");
    } 

    
    var from = Blockchain.transaction.from;
    var old_content = this.wish.get(from);
    if(isEmpty(old_content)){
      old_content = ""
    }
    var new_content = (old_content + "," + content);
   
    this.wish.set(from, new_content);
    
  },

  find: function(from){
    return this.wish.get(from);
  },

  test: function(){
    return "wish_wall";
  },

  test2: function(){
    this.wish.set("xxx", ["qq","tt","xx"]);
    return this.wish.get("xxx");
  }


};

// 核心
module.exports = WishWall;



// 判断value是否为空
function isEmpty(value){
  try{
    if (!value || value.trim() === ""){
      return true
    }else if(value == null || value == "" || value == "undefined" || value == undefined || value == "null"){
      return true;
    }else{
      value = value.replace(/\s/g,"");
      if(value == ""){
        return true;
      }
      return false;
    }
  }catch (err){
    return false;
  }
}
