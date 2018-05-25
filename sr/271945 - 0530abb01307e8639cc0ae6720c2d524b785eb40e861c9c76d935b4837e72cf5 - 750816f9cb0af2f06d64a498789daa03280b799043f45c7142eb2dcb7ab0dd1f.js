
"use strict";
var Content = function (name,content,torrent) {
    this.name = name;
    this.msg = content;
    this.torrent = torrent;
};


Content.prototype={
    parse:function (text) {
        return new DepositeContent(text);
    },
    stringify:function (o) {
        return o.toString();
    }
};



//主体
var Main = function () {
    LocalContractStorage.defineMapProperty(this,"msg");
    LocalContractStorage.defineProperty(this,"size");
};


Main.prototype = {


    init:function () {
        this.size = 0;
    },


    saveMsg : function (name,content,torrent) {
        var size = this.size;
        var msg = new Content(name,content,torrent);
        this.msg.set(size,msg);
        size = size +1;
        this.size = size;
        return "发布成功！";

    },


    getMsg : function () {
        var messages = [];
        var size = this.size;
        var msg = this.msg;
        for(var i =0;i<size;i++){
            messages.push(this.msg.get(i));
        }
        return messages;
    }
};

module.exports = Main;