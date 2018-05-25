"use strict";

//留言信息
var MsgInfo = function(str){
    if(str){
        var obj = JSON.parse(str);
        this.address = obj.address;
        this.timestamp = obj.timestamp;
        this.nickname = obj.nickname;
        this.contents = obj.contents;
        this.qq = obj.qq;
    }else{
        this.address = '';
        this.timestamp = '';
        this.nickname = '';
        this.contents = '';
        this.qq = '';
    }

}

MsgInfo.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};


var Guestbook = function(){
 
    LocalContractStorage.defineMapProperty(this, "liu", {
        parse: function (text) {
            return new MsgInfo(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
}

Guestbook.prototype = {
    init: function () {
        // todo
    },

    put: function (value) {

        console.log(value);

        if (value.length > 2000 ){
            throw new Error("字符太长")
        }
        console.log(value.timestamp);
        if(typeof value !== 'object'){
            value = JSON.parse(value);
        }
        if(value.contents.length>500){
            throw new Error("留言不能超过500个字")
        }
        var from = Blockchain.transaction.from;
        var Msg = new MsgInfo();
        Msg.address = from;
        Msg.qq = value.qq;
        Msg.contents = value.contents;
        Msg.timestamp = value.timestamp;
        Msg.nickname = value.nickname;
        this.liu.put(value.timestamp, Msg);
        return Msg;
    },

    delMsg: function (key) {
        var re =LocalContractStorage.delete(key);
        return re;
    }
};

module.exports = Guestbook;