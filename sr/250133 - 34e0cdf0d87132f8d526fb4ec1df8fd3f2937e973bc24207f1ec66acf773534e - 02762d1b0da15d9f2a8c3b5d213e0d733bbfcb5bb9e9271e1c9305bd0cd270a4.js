"use strict";

var UserItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.username = obj.username;
        this.level = obj.level;
        this.belong = obj.belong;
    } else {
        this.username = "";
        this.level = "";
        this.belong = "";
    }
};

UserItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var TenDrop = function () {
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

TenDrop.prototype = {
    init: function () {
        this.size=0;
    },

    save: function (username, level) {
        //这里是传入的数据
        username = username.trim();
        level = level.trim();
        if (username === "" || level === ""){
            throw new Error("empty key / value");
        }
        if (level.length > 20 || username.length > 15){
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
            userItem.level = level;
            this.score.put(from, userItem);

        }else{
            //用户还没有存入数据的情况
            userItem = new UserItem();
            userItem.belong = from;
            userItem.username = username;
            userItem.level = level;
            this.score.put(from, userItem);

            //处理arrayMap,arrayMap和size配合主要是记录存入了多少个人的信息，并且把index和钱包地址映射起来
            this.arrayMap.set(index, from);
            this.size +=1;
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
module.exports = TenDrop;