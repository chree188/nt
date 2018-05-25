'use strict';

var PoisonItem = function (text) {
  if (text) {
    var obj = JSON.parse(text);
    this.key = obj.key;
    this.content = obj.content;
    this.imageUrl = obj.imageUrl;
  } else {
    this.key = "";
    this.content = "";
    this.imageUrl = "";
  }
  this.star = 0
};

var Poison = function () {
	 LocalContractStorage.defineMapProperty(this, "poison");//记录每个毒鸡汤的信息
	 LocalContractStorage.defineMapProperty(this, "keyIndex");//记录每条数据对应的索引
	 LocalContractStorage.defineProperty(this, "size");//记录数据长度
};

Poison.prototype = {
   init: function () {
   		this.size = 0;
   },
   addPosion: function (key, value) {
   		// if(this._isBlank(key) && this._isBlank(value)){
   		// 	throw new Error("empty key | value");
   		// }
   		var from = Blockchain.transaction.from;
   		var hash = Blockchain.transaction.hash;
   		var posi = this.poison.get(key);
   		if(posi){
   			throw new Error("this poison is exits");
   		}
   		var item = new PoisonItem(value);
   		item.from = from;
   		item.createTime = Blockchain.block.timestamp;
   		item.hash = hash;
   		var index = this.size;
   		this.poison.set(key,item);
   		this.keyIndex.set(index,key);
   		this.size = index + 1;
   		return this.size;
   },
   _isBlank: function(str) {
   		str = str.trim();
   		return str.length == 0;
   },
   getPosion: function (limit,offset) {
   	return this._getPoisonOrderDesc(limit,offset,false);
   },
   getPosionByMine: function(){
   	var from = Blockchain.transaction.from;
   	return this._getPoisonOrderDesc(0,9999,from);
   },
   star:function(key,star){
   	star = parseInt(star);
   	var item = this.poison.get(key);
  	if(star == 1){
   		item.star = item.star + 1
  	}else{
   		item.star = item.star - 1
   	}
   	this.poison.set(key+"1",item)
   	return this.poison.get(key);
   },
   _getPoisonOrderDesc: function(limit,offset,from){
			limit = parseInt(limit);
	    offset = parseInt(offset);
	    var number = offset * (limit+1);//获取总量
	    if(number > this.size){
	      number = this.size;
	    }
	    var size = this.size;
	    var list = [];
	    for(var i=size-1;i>=0;i--){
	      var key = this.keyIndex.get(i);
	      var object = this.poison.get(key);
	      if(from){
	      	if(object.from == from){
	      		list.push(object)		
	      	}
	      }else{
	      	list.push(object)
	      }
	      if(list.length >= number){
	      	break;
	      }
	    }
	    return {list,size}
   }
};

module.exports = Poison;