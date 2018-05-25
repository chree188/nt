"use strict";

//启动信息
var DrawBeginInfo = function(str){
    if(str){
        var obj = JSON.parse(str);
        this.address = obj.address;
        this.timestamp = obj.timestamp;
        this.drawid = obj.drawid;
    }else{
        this.address = '';
        this.timestamp = '';
        this.drawid = '';
    }

}

DrawBeginInfo.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};


var DrawPrize = function(){
     LocalContractStorage.defineMapProperty(this, "begin", {
        parse: function (text) {
            return new DrawBeginInfo(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
}

DrawPrize.prototype = {
    init: function () {
        // todo
    },

    begins: function(key, value){
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
        var drawBegin = this.begin.get(key);
        if (drawBegin){
            throw new Error("value has been occupied");
        }
        drawBegin = new DrawBeginInfo();
        drawBegin.address = from;
        drawBegin.drawid = key;
        drawBegin.timestamp = value.timestamp;
        this.begin.put(key, drawBegin);
    },

    getBegin: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("empty key")
        }
        return this.begin.get(key);
    },

};
module.exports = DrawPrize;