"use strict";

// 这是本人开发的第一个智能合约，以前从事web开发，第一次接触感觉还是比较难以上手
// 主要是一些概念和系统的东西，wiki里面基本上来说还是针对已经有智能合约开发经验的，目前还比较杂乱
// 希望能够从web开发的思想，转变到智能合约开发的思想，其中的思想和经验可以相互融合促进
// 希望从web转到智能合约开发的web_to_smart_contract新手能更快上手

// ************************************************************

// 以下注释均是自己从web思维写的，可能理解有误，希望以后得到纠正
// 也许要放弃web思维，但是先走一步算一步吧，毕竟从零开始 by Jacob Zhou

/*
    ****************需求描述********************
    * [写信] 用户创建一封信
    ** 包含to(收信人), content(内容), 限制打开时间（can_open_at）
    * [信箱] 显示用户写的所有信
    * [读信] 显示一封信的内容
 */

/*
 *  ****************约定********************
 *  * 每个模型都有id字段，作为主键，暂时使用uuid
 *  * 每个模型都有created_at字段，作为创建的时间，取当前时间
 *  * user_id = 钱包地址，及用户的帐号
 */

/*
 *  ****************巨坑!!!********************
 *  * call页面的arguments输入参数不能用单引号，如['x', 'y'], 必须["x", "y"], Test会返回{}, 没有任何提示, 返回{}的都是参数有问题
 *  * 新手记得随时点submit， 一旦发现返回不对，第一想到上一步有没有submit
 *  * Test返回contract check failed .. 是表示submit还没success, 需要再等一会
 *  *  
 */


// 定义一个模型（相当于表）
// 信，存储信的基本信息.
var Letter = function(text) {
  if (text) {
    var obj = JSON.parse(text); 
    this.id = obj.id; // 主键
    this.to = obj.to; // 收信人
    this.content = obj.content; // 内容
    this.can_open_at = obj.can_open_at; // 限制打开信的时间
    this.user_id = obj.user_id; // 用户id（也就是钱包地址）
    this.created_at = obj.created_at; // 创建时间
  } else {
    this.id = guuid(); // id自动填充uuid
    // this.id = ""; // id自动填充uuid
    this.to = "";
    this.content = "";
    this.can_open_at = "";
    // this.user_id = "";// 自动获取当前用户钱包地址作为ID
    this.user_id = Blockchain.transaction.from; // 自动获取当前用户钱包地址作为ID
    this.created_at = getNowFormatDate();
    // this.created_at = "";
  }
};

// 定义模型的方法
Letter.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};



var ChainLetter = function () {
  LocalContractStorage.defineMapProperty(this, "letters", {
    // 读取自定义
    parse: function (text) {
      return new Letter(text);
    },
    // 存储自定义
    stringify: function (o) {
      return o.toString();
    }
  });

  LocalContractStorage.defineMapProperty(this, "user_letters", {
    // 存储自定义
    stringify: function (o) {
      return o.toString();
    },

    // 读取自定义
    parse: function (text) {
      return text.split(",");
    }

  });

  // LocalContractStorage.defineMapProperty(this, "user_letters", {});
}

ChainLetter.prototype = {
  init: function () {
    // todo 暂时不知道干嘛用的
  },

  save: function (to, content, can_open_at) {

    var to = to.trim();
    var content = content.trim();
    var can_open_at = can_open_at.trim();

    if (isEmpty(to) || isEmpty(content) || isEmpty(can_open_at)){
      throw new Error("收信人/内容/锁定时间 不能为空");
    } 

    var letter = new Letter();
    letter.to = to;
    letter.content = content;
    letter.can_open_at = can_open_at;

    console.log(letter.toString());
    
    var user_id = Blockchain.transaction.from;
    var letter_ids = this.user_letters.get(user_id);


    if(isEmpty(letter_ids)){
      var letter_ids = []
    }
    
    letter_ids[letter_ids.length] = letter.id;

    LocalContractStorage.set("last_id", letter.id)
    this.letters.set(letter.id, letter);
    this.user_letters.set(user_id, letter_ids);
    
    return "letter_ids :" + letter_ids + "last_id: " + LocalContractStorage.get("last_id") + " letter: " + letter.toString();
  },

  save_letter_id: function(id){
    var user_id = Blockchain.transaction.from;
    var letter_ids = this.user_letters.get(user_id);
    var org_letter_ids = this.user_letters.get(user_id);
    if(isEmpty(letter_ids)){
      var letter_ids = []
    }
    
    letter_ids[letter_ids.length] = id;

    this.user_letters.set(user_id, letter_ids);
    
    return "id: "+ id + " letter_ids:" + letter_ids.toString() + " user_id: " + user_id + " get: " + this.user_letters.get(user_id) + " org_letter_ids: " + org_letter_ids + " Array?: " + (org_letter_ids instanceof Array);
  },

  get_letter_ids: function(){
    var user_id = Blockchain.transaction.from;
    var letter_ids = this.user_letters.get(user_id);
    if(isEmpty(letter_ids)){
      letter_ids = []
    }
    return letter_ids;
  },

  get_user_letters: function(){
    var user_id = Blockchain.transaction.from;
    return this.user_letters.get(user_id);
  },

  get_my_letters: function(){
    var rs  = [];
    var user_id = Blockchain.transaction.from;
    var letter_ids = this.user_letters.get(user_id);
    if(isEmpty(letter_ids)){
      var letter_ids = []
    }
    for(var i = 0; i < letter_ids.length; i++){
      rs[i] = this.letters.get(letter_ids[i]);
    }
    return rs;
  },

  get: function(letter_id){
    return this.letters.get(letter_id);
  },

  get_last_id: function(){
    return LocalContractStorage.get("last_id");
  },

  test: function(){
    return "love";
  },

  test2: function(){
    LocalContractStorage.set("name", "fuck you");
    return LocalContractStorage.get("name");
  },

};

// 核心
module.exports = ChainLetter;



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

// 生成uuid.
function guuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}

// 获取当前时间的string格式
function getNowFormatDate() {
  var date = new Date();
  var seperator1 = "-";
  var seperator2 = ":";
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  if (month >= 1 && month <= 9) {
      month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
      strDate = "0" + strDate;
  }
  var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
          + " " + date.getHours() + seperator2 + date.getMinutes()
          + seperator2 + date.getSeconds();
  return currentdate;
}