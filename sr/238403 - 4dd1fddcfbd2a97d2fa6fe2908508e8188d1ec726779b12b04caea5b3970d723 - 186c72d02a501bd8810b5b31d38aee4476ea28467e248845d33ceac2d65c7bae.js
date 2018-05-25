"use strict";



// 定义数据的结构
var DreamItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.key = obj.key;       // 昵称或者姓名
        this.value = obj.value;   // 创建的内容
        this.author = obj.author; // 创建人的钱包地址
        this.date = obj.date;     // 创建的时间
    } else {
        this.key = "";
        this.value = "";
        this.author = "";
        this.date = "";
    }
};



DreamItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};



var DreamSet = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new DreamItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};



DreamSet.prototype = {

    init: function () {
        // nothing
    },


    // 查询操作
    select: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("empty key")
        }
        return this.repo.get(key);
    },


    // 保存操作
    save: function (key, value) {

        key = key.trim();
        value = value.trim();
        if (key === "" || value === ""){
            throw new Error("empty key / value");
        }
        if (value.length > 64 || key.length > 64){
            throw new Error("key / value exceed limit length")
        }

        // 获取当前交易钱包的地址
        var from = Blockchain.transaction.from;

        // 查询判断该词条是否已经存在
        var dreamItem = this.repo.get(key);
        if (dreamItem){
            throw new Error("value has been occupied");
        }

        dreamItem = new DreamItem();
        dreamItem.key = key;
        dreamItem.value = value;
        dreamItem.author = from;
        dreamItem.date = Date.parse(new Date());   // 获取当前时间戳(以毫秒为单位)

        this.repo.put(key, dreamItem);
    }

};
module.exports = DreamSet;