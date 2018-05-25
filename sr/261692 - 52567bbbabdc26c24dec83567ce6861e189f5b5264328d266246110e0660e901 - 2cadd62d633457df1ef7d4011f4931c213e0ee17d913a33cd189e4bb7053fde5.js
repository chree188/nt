"use strict";

var Chatroom = function () {
    LocalContractStorage.defineProperty(this, "dbSize");
    LocalContractStorage.defineMapProperty(this, "dbs");
    LocalContractStorage.defineMapProperty(this, "accounts");
};

Chatroom.prototype = {
    init: function () {
        this.dbSize = 1;
    },

    sendMsg: function (nickname, content) {
        content = content.trim();
        nickname = nickname.trim();
        if (content === ""){
            throw new Error("消息内容不能为空！");
        }
        if (content.length > 256){
            throw new Error("消息内容不能超过256个字符！")
        }

        var from = Blockchain.transaction.from;
        var messages = this.dbs.get('db_' + this.dbSize) || [];
        var msg = {
            'from': from,
            'ts': new Date().getTime(),
            'msg': content,
            'nickname': nickname
        };
        if(messages && messages.length >= 100){
            this.dbSize++;
            messages = [];
        }
        messages.push(msg);
        this.dbs.put('db_' + this.dbSize, messages);
    },

    history: function (index) {
        if ( index === "" ) {
            index = 1;
        }
        if(index <1){
            index =1;
        }
        return this.dbs.get('db_' + index);
    },
    register: function(nickname, password, password2){
        if(nickname === ""){
            throw new Error("昵称不能为空！");
        }
        if(nickname.length < 2 || nickname.length > 12){
            throw new Error("昵称长度必须在2~12位！");
        }
        if(password === "" || password.length != 32){
            throw new Error("密码格式错误！");
        }
        if(password != password2){
            throw new Error("两次输入的密码不一致！")
        }
        var account = this.accounts.get(nickname);
        if(account){
            throw new Error("对不起，该昵称已存在！");
        }
        var from = Blockchain.transaction.from;
        var account = {
            "password": password,
            "from": from
        }
        this.accounts.put(nickname, account);
    },
    login: function(nickname, password){
        var account = this.accounts.get(nickname);
        if(account && account.password == password){
            return JSON.stringify({
                'result': 'ok'
            });
        }else{
            return JSON.stringify({
                'result': 'failed'
            });
        }
    }
};
module.exports = Chatroom;