"use strict";

var Chatroom = function () {
    LocalContractStorage.defineMapProperty(this, "dbs");
    LocalContractStorage.defineMapProperty(this, "accounts");
    LocalContractStorage.defineProperty(this, "channels");
};

Chatroom.prototype = {
    init: function () {
        var channels = [];
        channels.push({
            'id': 1,
            'name': '默认组',
            'iconUrl': 'http://7u2ne2.com1.z0.glb.clouddn.com/neb.png'
        })
        channels.push({
            'id': 2,
            'name': '区块链',
            'iconUrl': 'http://7u2ne2.com1.z0.glb.clouddn.com/qukuailian.png'
        })
        channels.push({
            'id': 3,
            'name': '影视圈',
            'iconUrl': 'http://7u2ne2.com1.z0.glb.clouddn.com/dianying.png'
        })
        this.channels = channels;
    },

    sendMsg: function (channelId, nickname, content) {
        content = content.trim();
        nickname = nickname.trim();
        channelId = channelId.trim();
        if (content === ""){
            throw new Error("消息内容不能为空！");
        }
        if (content.length > 256){
            throw new Error("消息内容不能超过256个字符！")
        }

        var from = Blockchain.transaction.from;
        var messages = this.dbs.get(channelId) || [];
        var msg = {
            'from': from,
            'ts': new Date().getTime(),
            'msg': content,
            'nickname': nickname
        };
        messages.push(msg);
        this.dbs.put(channelId, messages);
    },
    history: function (offset, num) {
        var result = [];
        var messages = this.dbs.get(channelId);
        if(messages){
            var start = messages.length - 1 - offset;
            var end = messages.length - 1 - offset-num;
            for(var i=start;i>=end;i--){
                result.push(message[i]);
            }
        }
        return result;
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
            return {
                'result': 'ok'
            };
        }else{
            return {
                'result': 'failed'
            };
        }
    },
    createChannel: function(name, iconUrl){
        var channels = this.channels;
        var channel = {
            'name': name,
            'iconUrl': iconUrl,
            'id': new Date().getTime()
        }
        if(!channels){
            channels = [];
        }
        channels.push(channel);
        this.channels = channels;
    },
    getChannels: function(){
        return this.channels || [];
    },
    editChannel: function (id, name, iconUrl) {
        var channels = this.channels;
        for(var i=0;i<channels.length;i++){
            var channel = channels[i];
            if(channel.id == id){
                channel.name = name;
                channel.iconUrl = iconUrl;
            }
        }
        this.channels = channels;
    },
    removeChannel: function(id){
        var channels = [];
        for(var i=0;i<this.channels.length;i++){
            var channel = this.channels[i];
            if(channel.id != id){
                channels.push(channel);
            }
        }
        this.channels = channels;
    },
    messageSize: function (channelId) {
        return this.dbs.get(channelId).length;
    }
};
module.exports = Chatroom;