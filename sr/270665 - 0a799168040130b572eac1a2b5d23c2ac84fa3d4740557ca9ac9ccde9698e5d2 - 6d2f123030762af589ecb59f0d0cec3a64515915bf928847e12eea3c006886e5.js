
"use strict";
var Content = function (name,content) {
    this.name = name;
    this.msg = content;
};
Content.prototype={

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

    saveMsg : function (name,content) {
        var size = this.size;
        var msg = new Content(name,content);
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