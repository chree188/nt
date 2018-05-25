"use strict";


var DictItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.key = obj.key;
        this.value = obj.value;
    } else {
        this.key = "";
        this.value = "";
    }
};
DictItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};


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
        var from = Blockchain.transaction.from+timestamp;
        var index = this.size;
        this.arrayMap.set(index, from);
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
    forEach: function(limit, offset){
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
        for(var i=offset;i<number;i++){
            var key = this.arrayMap.get(i);
            var object = this.dataMap.get(key);
            var temp={
                key:key,
                value:object
            }
            //result += "index:"+i+" key:"+ key + " value:" +object+"_";
            result.push(temp);
        }
        return JSON.stringify(result);
    }
};
module.exports = WishContract;