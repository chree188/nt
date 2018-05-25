"use strict";

var UserItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.username = obj.username;
        this.userPic=obj.userPic;
        this.level = obj.level;
        this.belong = obj.belong;

    } else {
        this.username = "";
        this.userPic = "";
        this.level = "";
        this.belong = "";
    }
};

UserItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var XiaoYu = function () {
    LocalContractStorage.defineMapProperty(this, "score", {
        parse: function (text) {
            return new UserItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineProperty(this, "size");
};

XiaoYu.prototype = {
    init: function () {
        this.size=0;
    },

    save: function (username, userPic,level) {
        //这里是传入的数据
        username = username.trim();
        userPic=userPic.trim();
        level = level.trim();
        if (username === "" || level === ""||userPic==""){
            throw new Error("empty key / value");
        }
        if (level.length > 10 || username.length > 10||userPic.length>100){
            throw new Error("key / value exceed limit length")
        }
        var from = Blockchain.transaction.from;

        //本地的数据
        var index=this.size; //存入了多少条数据
        var userItem = this.score.get(from);
        if (userItem){
            //用户在合约中已经有数据了。那就删除原来的，然后把当前的添加上。
            this.score.del(from);

            userItem = new UserItem();
            userItem.belong = from;
            userItem.username = username;
            userItem.userPic=userPic;
            userItem.level = level;
            this.score.put(from, userItem);

        }else{
            //用户还没有存入数据的情况
            userItem = new UserItem();
            userItem.belong = from;
            userItem.username = username;
            userItem.userPic = userPic;
            userItem.level = level;
            this.score.put(from, userItem);

            //处理arrayMap,arrayMap和size配合主要是记录存入了多少个人的信息，并且把index和钱包地址映射起来
            this.arrayMap.set(index, from);
            this.size +=1;
        }
    },
    del:function (address) {
        var from = Blockchain.transaction.from;
        // 只有我们创始人的帐号才可以删除合约中一条数据
        if (from=="n1bczutr1zEhBWu4wq7apRQBNyGsaXJ1st7") {
            this.score.del(address);
        }
    },
    get: function (belong) {
        belong = belong.trim();
        if ( belong === "" ) {
            throw new Error("empty address")
        }
        return this.score.get(belong);
    },

    getAllData:function(){
        var result  = [];
        var totalSize =this.size;
        for (var i=0;i<totalSize;i++){
            var from = this.arrayMap.get(i);
            // console.log(from)
            var userInfoStr = this.score.get(from);
            // console.log(userInfo)
            var userInfo=JSON.parse(userInfoStr)
            // result += "index:"+i+" key:"+ key + " value:" +object+"_";
            result.push(userInfo)
        }

        return result
    }
};
module.exports = XiaoYu;