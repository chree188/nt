"use strict";

/*
  名称：星云心愿贴纸墙 
  项目编号：No. 2 
  版本：1.0 代码地址：https://gitee.com/JacobDota/nas_wish_wall
  描述：
  * 基于ruby on rails和星云链技术，账户信息存在mysql，钱包地址和内容存在星云链。
  * 用户可以通过名字和钱包地址创建唯一账户，在贴纸墙上发布心愿。
 */


var WishWall = function () {
  LocalContractStorage.defineMapProperty(this, "wish");
}

WishWall.prototype = {
  init: function () {
  },

  save: function (content) {

    content = content.trim();
    var new_content = content;

    if (isEmpty(content)){
      throw new Error("内容不能为空");
    } 

    
    var from = Blockchain.transaction.from;
    var old_content = this.wish.get(from);
    if(!isEmpty(old_content)){
      new_content = (old_content + "," + content);
    }
   
    this.wish.set(from, new_content);
    
  },

  find: function(from){
    return this.wish.get(from);
  },

  list: function(){
    var from = Blockchain.transaction.from;
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
