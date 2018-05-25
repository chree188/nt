"use strict";

//启动信息
var VedioInfo = function(str){
    if(str){
        var obj = JSON.parse(str);
        this.address = obj.address;
        this.url = obj.url;
        this.drawid = obj.drawid;
    }else{
        this.address = '';
        this.url = '';
        this.drawid = '';
    }

}

VedioInfo.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};


var PlayVedio = function(){
     LocalContractStorage.defineMapProperty(this, "begin", {
        parse: function (text) {
            return new VedioInfo(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
}

PlayVedio.prototype = {
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
        if(typeof value !== 'object'){
            value = JSON.parse(value);
        }
        var from = Blockchain.transaction.from;
        Vedio = new VedioInfo();
        Vedio.address = from;
        Vedio.drawid = key;
        Vedio.url = value.url;
        this.begin.put(key, Vedio);
    },

};
module.exports = PlayVedio;