"use strict";

// 每一条树洞秘密Object :{
//     key唯一标志，
//     nickname： 昵称，
//     context:写的内容；
//     petNickname:宠物昵称;
//     img:图片地址;
//     wallet:智能合约的调用钱包地址
//  }
var PetItem=function(text){
    if (text) {
      var obj = JSON.parse(text);
      this.key = obj.key;
      this.nickname=obj.nickname;
      this.context = obj.context;
      this.petNickname = obj.petNickname;
      this.time=obj.time;
      this.wallet = obj.wallet;
      this.img=obj.img;
      
    } else {
      this.key = "";
      this.nickname='';
      this.context = "";
      this.petNickname = "";
      this.time="";
      this.wallet = "";
      this.img='';
    }  
};

PetItem.prototype={
  toString:function() {
    return JSON.stringify(this);
}}

var PetSociety = function () {
  LocalContractStorage.defineMapProperty(this, "petItemKey");
  LocalContractStorage.defineProperty(this, "size");
  LocalContractStorage.defineMapProperty(this, "repo", {
    parse: function (text) {
      return new PetItem(text);
    },
    stringify: function (o) {
      return o.toString();
    }
  });
};

PetSociety.prototype = {
  init: function () {
      this.size=0;
  },

  save: function (key,nickname,context,petNickname,time,img) {
    key = key.trim();
    nickname=nickname.trim();
    context = context.trim();
    
    if (key === "" || context === ""||nickname==='') {
      throw new Error("必填项不能为空");
    }

    var from = Blockchain.transaction.from;
    var petItem = this.repo.get(key);
    if (petItem) {
      throw new Error("value has been occupied");
    }

    petItem = new PetItem();
    petItem.wallet = from;
    petItem.key = key;
    petItem.nickname=nickname;
    petItem.context = context;
    petItem.petNickname = petNickname;
    petItem.time = time;
    petItem.img=img;

    var index = this.size;
  
    this.petItemKey.set(index,key);
    this.repo.set(key, petItem);
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

// 反向获取列表，支持分页查询
  getAll: function (limit,offset){
    limit = parseInt(limit);
    offset = parseInt(offset);
    var list = [];

    var fetchIndex=this.size-offset*limit-1;
    var endIndex=this.size-offset*(limit+1)-1;
    if(fetchIndex>=0){
      if(endIndex<-1){
        endIndex=-1
      }
      for(var i=fetchIndex;i>endIndex;i--){
        var key = this.petItemKey.get(i);
        var object = this.repo.get(key);
        list.push(object)
      }
    }
    return {datalist:list,total:this.size} 
  }
};
module.exports = PetSociety;