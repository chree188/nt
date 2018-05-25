"use strict";

var DictItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.key = obj.key;//简介
		this.value = obj.value;//时间 写死
		this.author = obj.author;//打卡人
	} else {
	    this.key = "";
	    this.author = "";
	    this.value = "";
	}
};

DictItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var SuperDictionary = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {//记录单个用户的信息 eg:{user1-20181102:'name'=>'1234'}
        parse: function (text) {//存储
            return new DictItem(text);
        },
        stringify: function (o) {//读取
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineProperty(this, "size");//记录总数
};

SuperDictionary.prototype = {
    init: function () {
        // todo
        this.size = 0;
    },

    save: function (key) {
        key = key.trim();
        if (key === "" ){
            throw new Error("empty key / value");
        }
        if (key.length > 64){
            throw new Error("key / value exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var now = new Date();
        var now_time = now.getFullYear() + '-' + (now.getMonth()+1) + '-' + now.getDate();
        var repokey = from + '-' + now_time;
        var dictItem = this.repo.get(repokey);
        if (dictItem){
            throw new Error("Today you have done it!");
        }
        var index = this.size;
        //处理集合
        this.arrayMap.set(index,repokey);//日期为key
        dictItem = new DictItem();
        dictItem.author = from;//打卡人
        dictItem.key = key;//简介
        dictItem.value = now_time;//打开时间
        this.repo.put(repokey, dictItem);//日期为key
        this.size += 1;//记录加1
    },
    len:function(){//dd:2018-11-01
      return this.size;
    },
/*    get_all: function () {
        var now = new Date();
        var now_time = now.getFullYear() + '-' + now.getMonth() + '-' + now.getDate();
        return this.arrayMap.get(now_time);
    },*/
 /*   get_one: function () {
        var from = Blockchain.transaction.from;
        var now = new Date();
        var now_time = now.getFullYear() + '-' + now.getMonth() + '-' + now.getDate();
        return this.repo.get(from + '-' + now_time);
    },*/
    forEach: function(limit, offset){//可以分页用 limit 限制几个  offset：边界
        limit = parseInt(limit);
        offset = parseInt(offset);
        var now = new Date();
        var now_time = now.getFullYear() + '-' + (now.getMonth()+1) + '-' + now.getDate();
        var size = this.size;
        if(offset>size){
           throw new Error("offset is not valid");
        }
        var number = offset+limit;
        if(number > size){
          number = size;
        }
        var result  = "";
        for(var i=offset;i<number;i++){
            var key = this.arrayMap.get(i);//取出作者名+时间
            var object = this.repo.get(key);
            //result += "index:"+i+" key:"+ key + " value:" +object+"_";
            result += object+",";
        }
        return result;
    },
};
module.exports = SuperDictionary;