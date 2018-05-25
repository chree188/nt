"use strict";

//领奖信息
var PrizeInfo = function(str){
    if(str){
        var obj = JSON.parse(str);
        this.address = obj.address;
        this.timestamp = obj.timestamp;
        this.drawid = obj.drawid;
        this.userrname = obj.userrname;
        this.mobile = obj.mobile;
        this.prizename = obj.prizename;
    }else{
        this.address = '';
        this.timestamp = '';
        this.drawid = '';
        this.userrname = '';
        this.mobile = '';
        this.prizename = '';
    }

}

PrizeInfo.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};


var GetPrize = function(){
 
    LocalContractStorage.defineMapProperty(this, "prize", {
        parse: function (text) {
            return new PrizeInfo(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
}

GetPrize.prototype = {
    init: function () {
        // todo
    },

    getprize: function (key, value) {
        console.log(key);
        console.log(value);
        key = key.toString().trim();
        if (key === "" || value === ""){
            throw new Error("empty key / value");
        }
        if (value.length > 2000 || key.length > 2000){
            throw new Error("key / value exceed limit length")
        }
        console.log(value.timestamp);
        if(typeof value !== 'object'){
            value = JSON.parse(value);
        }
        var from = Blockchain.transaction.from;
        var Prize = this.prize.get(key);
        if (Prize){
            throw new Error("奖品已被领取");
        }
        Prize = new PrizeInfo();
        Prize.address = from;
        Prize.drawid = key;
        Prize.mobile = value.mobile;
        Prize.timestamp = value.timestamp;
        Prize.userrname = value.userrname;
        Prize.prizename = value.prizename;
        this.prize.put(key, Prize);
    },

    getPrize: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("empty key")
        }
        return this.prize.get(key);
    }
};

module.exports = GetPrize;