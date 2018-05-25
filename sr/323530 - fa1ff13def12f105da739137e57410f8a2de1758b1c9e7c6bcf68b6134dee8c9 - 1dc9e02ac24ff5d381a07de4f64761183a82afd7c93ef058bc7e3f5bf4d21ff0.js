"use strict";


// MyEpitaph 合约

// 为自己写墓志铭，是表示自己开得开生死，对无法避免的死亡持有一种乐观豁达的心境。
// 基于星云链，利用区块链的不可篡改的特点，永久记录在区块链上，不会丢失。等几十年后在来回顾现在为自己写的墓志铭，可能还有一番风味。




// 定义数据的结构
var Epitaph = function(text) {
    if (text) {
        // 把字符串转换为Json对象
        var obj = JSON.parse(text);
        this.key = obj.key;
        this.value = obj.value;
        this.author = obj.author;
        this.date = obj.date;     // 创建的时间
    } else {
        this.key = "";
        this.value = "";
        this.author = "";
        this.date = "";
    }
};




// 向对象添加属性和方法
Epitaph.prototype = {
    toString: function () {
                // 把Json对象转换为Json字符串，并返回。
        return JSON.stringify(this);
    }
};




// 智能合约部分
var EpitaphContract = function () {

    // 定义一个Map数据类型的存储空间，用于存储词条的内容。绑定到名为“mzl”的属性上面    
    LocalContractStorage.defineMapProperty(this, "mzm", {
        parse: function (text) {
            return new Epitaph(text);
        },

        stringify: function (o) {
        
            return o.toString();
        }
    });
};



EpitaphContract.prototype = {
    init: function () {
        // nothing
    },



    // 查询操作
    select: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("empty key")
        }
        return this.mzm.get(key);
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
        var epitaph = this.mzm.get(key);
        if (epitaph){
            throw new Error("value has been occupied");
        }
        epitaph = new Epitaph();
        epitaph.key = key;
        epitaph.value = value;

        epitaph.author = from;

        epitaph.date = Date.parse(new Date());   // 获取当前时间戳(以毫秒为单位)

        this.mzm.put(key, epitaph);
    }

};


// 2018.05.25 wym
module.exports = EpitaphContract;