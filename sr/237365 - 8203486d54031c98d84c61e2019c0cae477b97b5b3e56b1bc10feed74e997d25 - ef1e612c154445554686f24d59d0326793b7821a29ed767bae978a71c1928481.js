"use strict";

var Chatroom = function () {
    LocalContractStorage.defineProperty(this, "dbSize");
    LocalContractStorage.defineMapProperty(this, "dbs");
};

Chatroom.prototype = {
    init: function () {
        this.dbSize = 1;
    },

    sendMsg: function (content) {
        content = content.trim();
        if (content === ""){
            throw new Error("消息内容不能为空！");
        }
        if (content.length > 256){
            throw new Error("消息内容不能超过256个字符！")
        }

        var from = Blockchain.transaction.from;
        var messages = this.dbs.get('db_' + this.dbSize)
        var msg = {
            'from': from,
            'ts': new Date().getTime(),
            'msg': content
        };
        if(messages && messages.length >= 100){
            this.dbSize++;
        }
        this.dbs.put('db_' + this.dbSize, msg)
    },

    history: function (index) {
        if ( index === "" ) {
            index = 1;
        }
        if(index <1){
            index =1;
        }
        return this.dbs.get('db_' + index);
    }
};
module.exports = Chatroom;