"use strict";

// 每一条树洞秘密Object :{
//     key唯一标志，
//     nickname： 昵称，
//     context:写的内容；
//     moodStar：心情指数;
// wallet:智能合约的调用钱包地址
//  }
var SecretItem=function(text){
    if (text) {
      var obj = JSON.parse(text);
      this.key = obj.key;
      this.nickname=obj.nickname;
      this.context = obj.context;
      this.moodStar = obj.moodStar;
      this.time=obj.time;
      this.wallet = obj.wallet;
    } else {
      this.key = "";
      this.nickname='';
      this.context = "";
      this.moodStar = "";
      this.time="";
      this.wallet = "";
    }  
};

SecretItem.prototype={
  toString:function() {
    return JSON.stringify(this);
}}

var SecretLib = function () {
  LocalContractStorage.defineMapProperty(this, "secretItemKey");
  LocalContractStorage.defineProperty(this, "size");
  LocalContractStorage.defineMapProperty(this, "repo", {
    parse: function (text) {
      return new SecretItem(text);
    },
    stringify: function (o) {
      return o.toString();
    }
  });
};

SecretLib.prototype = {
  init: function () {
      this.size=0;
  },

  save: function (key,nickname,context,moodStar,time) {
    key = key.trim();
    nickname=nickname.trim();
    context = context.trim();
    
    if (key === "" || context === ""||nickname==='') {
      throw new Error("必填项不能为空");
    }

    var from = Blockchain.transaction.from;
    var secretItem = this.repo.get(key);
    if (secretItem) {
      throw new Error("value has been occupied");
    }

    secretItem = new SecretItem();
    secretItem.wallet = from;
    secretItem.key = key;
    secretItem.nickname=nickname;
    secretItem.context = context;
    secretItem.moodStar = moodStar;
    secretItem.time = time;
    var index = this.size;
  
    this.secretItemKey.set(index,key);
    this.repo.set(key, secretItem);
    this.size = index + 1;
    return this.size
  },

  get: function (key) {
    key = key.trim();
    if (key === "") {
      throw new Error("empty key")
    }
    return this.repo.get(key);
  },

// 获取树洞秘密列表
  getAll: function (limit,offset){
    limit = parseInt(limit);
    offset = parseInt(offset);
    var number = offset * (limit+1);
    if(number > this.size){
      number = this.size;
    }
    var list = [];
    for(var i=limit;i<number;i++){
      var key = this.secretItemKey.get(i);
      var object = this.repo.get(key);
      list.push(object)
    }
    return list.reverse();
  }
};
module.exports = SecretLib;