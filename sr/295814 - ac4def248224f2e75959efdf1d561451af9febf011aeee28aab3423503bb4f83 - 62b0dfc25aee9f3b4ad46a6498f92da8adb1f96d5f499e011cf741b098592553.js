"use strict";

var Guishouzhengba = function() {
    LocalContractStorage.defineProperty(this, "gsid");
    LocalContractStorage.defineMapProperty(this, "datagsMap");
};

Guishouzhengba.prototype = {
    init: function() {
        this.gsid = 0;
    },
    savegs: function(nickname,count) {//添加鬼手争霸排行
        nickname = nickname.trim();

        if (nickname === "") {
            throw new Error("empty nickname name");
        }

        if (count<0 || count>1000) {
            throw new Error("Invalid number");
        }

        var key = this.gsid;
        var obj = new Object();
        obj.index = key;
        obj.nickname = nickname;
        obj.addr = Blockchain.transaction.from;
        obj.createdDate = Blockchain.transaction.timestamp;
        obj.count = count;

        this.datagsMap.set(key, JSON.stringify(obj));
        this.gsid += 1;
    },

    getAll: function() {//鬼手争霸赛排行榜
        var _this=this;
        var zsphArr=[];

        for(var i=0; i<this.gsid; i++){
            var tempObj = JSON.parse(_this.datagsMap.get(i));
            zsphArr.push(tempObj);
        }

        function sortId(a,b){
           return b.count-a.count
        }
        zsphArr.sort(sortId);

        return JSON.stringify(zsphArr);
    },

    delmx: function(gsid){//删除
        this.datagsMap.del(gsid);
    }

};

module.exports = Guishouzhengba;
