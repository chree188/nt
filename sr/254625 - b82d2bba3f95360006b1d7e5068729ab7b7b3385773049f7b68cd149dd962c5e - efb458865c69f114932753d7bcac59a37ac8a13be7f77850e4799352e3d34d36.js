/**
 * Created by fanlizhi on 2018/5/10.
 */
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
        var index = this.size;
        this.dataMap.set(index, value);
        this.size +=1;
    },
    get: function (key) {

        return this.dataMap.get(key);
    },
    len:function(){
        return this.size;
    },
    forEach: function(){
        var result = [];
        for(var i=0;i<=this.size;i++){
            var object = this.dataMap.get(i);
            if(object!=null){
                result.push(object);
            }
        }
        return JSON.stringify(result);
    }
};
module.exports = WishContract;
