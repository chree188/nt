"use strict";


var DictItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.key = obj.key;
		this.value = obj.value;
		this.author = obj.author;
		this.time = obj.time;
	} else {
	    this.key = "";
	    this.author = "";
	    this.value = "";
	    this.time = "";
	}
};

DictItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var SampleContract = function () {
   LocalContractStorage.defineMapProperty(this, "arrayMap");
   LocalContractStorage.defineMapProperty(this, "dataMap");
   LocalContractStorage.defineMapProperty(this, "loveMap");
   LocalContractStorage.defineProperty(this, "size");
};

SampleContract.prototype = {
    init: function () {
        this.size = 0;
    },

    set: function (key, value) {
        var index = this.size;
        if(this.dataMap.get(key)){
            throw new Error("已经添加过这个角色");
        }
        this.arrayMap.set(index, key);
        // 使用内置对象Blockchain获取提交内容的作者钱包地址
        var from = Blockchain.transaction.from;
        var info = new DictItem();
                info.key = key;
                info.value = value;
                info.time = new Date().getTime();
                info.author = from;
        this.dataMap.set(key, info);
        this.size +=1;
    },

    get: function (key) {
        return this.dataMap.get(key);
    },

    len:function(){
      return this.size;
    },

    love:function(key){
       if(this.dataMap.get(key)){
            if(this.loveMap.get(key)){
                var count = this.loveMap.get(key);
                this.loveMap.del(key);
                this.loveMap.set(key, parseInt(count) + 1);
                console.log("love1111111");
            } else {
                this.loveMap.set(key, 1);
                console.log("love22222");
            }
            return this.loveMap.get(key);
        } else {
            throw new Error("没有喜欢的角色");
        }
    },

    loveSearch:function(key){
         console.log("2222");
       if(this.dataMap.get(key)){
            if(this.loveMap.get(key)){
                console.log("loveSearch2222");
               return this.loveMap.get(key);
            } else {
                throw new Error("找不到喜欢的角色2");
            }
        } else {
            throw new Error("找不到喜欢的角色");
        }
    },



//    forEach: function(limit, offset){
    forEach: function(){
        var limit = parseInt(100);
        var offset = parseInt(0);
        if(offset>this.size){
           throw new Error("offset is not valid");
        }
        var number = offset+limit;
        if(number > this.size){
          number = this.size;
        }
        var result  = '[';
//        var a = JSON.stringify(json);
        for(var i=offset;i<number;i++){
            var key = this.arrayMap.get(i);
            var object = this.dataMap.get(key);
            var a = JSON.stringify(object);
            if(i < number -1){
                result += a + ",";
            } else {
                 result += a + "";
            }
        }
        result += ']';

//        for(var i=offset;i<number;i++){
//            var key = this.arrayMap.get(i);
//            var object = this.dataMap.get(key);
//            result += "index:"+i+" key:"+ key + " value:" +object+"_";
//        }
        return result;
    }
};

module.exports = SampleContract;