"use strict";

//定义一个对象
var DictItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        //属性
        this.key = obj.key;
        this.value = obj.value;
    } else {
        this.key = "";
        this.value = "";
    }
};
//序列化对象
DictItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

//定义两个Map 用来存储数据
var WishContract = function () {
    LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineMapProperty(this, "dataMap");
    LocalContractStorage.defineProperty(this, "size");
};
WishContract.prototype = {
    init: function () {
        this.size = 0;
    },
    set: function (key,value) {

        var timestamp = Date.parse(new Date());
        //获取对方钱包地址
        var from = Blockchain.transaction.from+timestamp;
        var index = this.size;
        this.arrayMap.set(index, from);
        //传过来的值装到对象中
        var  dictItem = new DictItem();
        dictItem.key = key;
        dictItem.value = value;
        this.dataMap.set(from, dictItem);
        this.size +=1;
    },
    get: function (key) {
        return this.dataMap.get(key);
    },
    len:function(){
        return this.size;
    },
    //查询所有 根据偏移量和总量查询
    forEach: function(limit, offset,loveName){
        limit = parseInt(limit);
        offset = parseInt(offset);
        if(offset>this.size){
            throw new Error("offset is not valid");
        }
        var number = offset+limit;
        if(number > this.size){
            number = this.size;
        }
        var result = [];
        if(loveName){
            for(var i=offset;i<number;i++){
                var key = this.arrayMap.get(i);
                var object = this.dataMap.get(key);
                    var temp={
                        key:key,
                        value:object
                    };
                    //返回json字符串
                    //result += "index:"+i+" key:"+ key + " value:" +object+"_";
                if(loveName == temp.value.value){
                    result.push(temp);
                }




            }
        }
        return JSON.stringify(result);
    }
};
module.exports = WishContract;