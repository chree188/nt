"use strict";

var tankefight = function() {
    LocalContractStorage.defineProperty(this, "tkid");
    LocalContractStorage.defineMapProperty(this, "datatkMap");
};

tankefight.prototype = {
    init: function() {
        this.tkid = 0;
    },
    savegs: function(count,killtanke,roundcount,tktime) {//添加坦克大战排行

        var key = this.tkid;
        var obj = new Object();
        obj.index = key;
        obj.addr = Blockchain.transaction.from;
        obj.createdDate = Blockchain.transaction.timestamp;
        obj.count = count;                                       //分数
        obj.roundcount = roundcount;                             //回合
        obj.killtanke = killtanke;                               //杀死坦克数
        obj.tktime= tktime;                                      //通关时间

        this.datatkMap.set(key, JSON.stringify(obj));
        this.tkid += 1;
    },

    getAll: function() {//坦克排行榜
        var _this=this;
        var zsphArr=[];

        for(var i=0; i<this.tkid; i++){
            var tempObj = JSON.parse(_this.datatkMap.get(i));
            zsphArr.push(tempObj);
        }

        function sortId(a,b){
           return b.count-a.count
        }
        zsphArr.sort(sortId);

        return JSON.stringify(zsphArr);
    },

    delmx: function(tkid){//删除
        this.datatkMap.del(tkid);
    }

};

module.exports = tankefight;
