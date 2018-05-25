'use strict';

//百科词条
var BaikeItem = function(obj){
    if(typeof obj === "string"){
        obj = JSON.parse(obj);
    }
    if(typeof obj === "object"){
        this.title = obj.title;
        this.desc = obj.desc;
    }else{
        this.title = "";
        this.desc = "";
    }
};

BaikeItem.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

//百科类
var Baike = function() {
    LocalContractStorage.defineMapProperties(this, {
        //定义账户的Map容器，用来存放每一个用户账单
        "baikes": {
            parse: function (value) {
                return new BaikeItem(value);
            },
            stringify: function (o) {
                return o.toString();
            }
        }
    });  
};

Baike.prototype = {

    //初始化
    init: function () {

    },

    //添加百科
    add: function (title, desc) {

        //调用地址
        var from = Blockchain.transaction.from;

        //新增一个数据
        var item = new BaikeItem({
            "title": title,
            "desc": desc,
            "time": Blockchain.transaction.timestamp.toString(10),
            "refer": from
        });

        this.baikes.set(title, item);
    },

    //查询百科
    query: function(title){
        return this.baikes.get(title)||[];
    }
};

module.exports = Baike;