"use strict";

var duobu = function() {
    LocalContractStorage.defineProperty(this, "dbid");
    LocalContractStorage.defineMapProperty(this, "datadbMap");
};

duobu.prototype = {
    init: function() {
        this.dbid = 0;
    },
    savedb: function(count) {//添加夺步排行

        var key = this.dbid;
        var obj = new Object();
        obj.index = key;
        obj.addr = Blockchain.transaction.from;
        obj.createdDate = Blockchain.transaction.timestamp;
        obj.count = count;

        this.datadbMap.set(key, JSON.stringify(obj));
        this.dbid += 1;
    },

    getAll: function() {//夺步排行榜
        var _this=this;
        var zsphArr=[];

        for(var i=0; i<this.dbid; i++){
            var tempObj = JSON.parse(_this.datadbMap.get(i));
            zsphArr.push(tempObj);
        }

        function sortId(a,b){
           return b.count-a.count
        }
        zsphArr.sort(sortId);

        return JSON.stringify(zsphArr);
    },

    delmx: function(dbid){//删除
        this.datadbMap.del(dbid);
    }

};

module.exports = duobu;
