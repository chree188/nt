"use strict";

var Chatroom = function () {
    LocalContractStorage.defineMapProperty(this, "diaryMap");
    LocalContractStorage.defineMapProperty(this, "accounts");
};

Chatroom.prototype = {
    init: function () {
    },
    postDiary: function (id, content, date) {
        var from = Blockchain.transaction.from;
        var account = this.accounts.get(id);
        if(!account || account.from != from){
            throw new Error("未授权");
        }
        if (content === ""){
            throw new Error("消息内容不能为空！");
        }
        if (content.length > 1000){
            throw new Error("消息内容不能超过1000个字符！")
        }

        var diarys = this.diaryMap.get(from) || [];
        var diary = {
            'from': from,
            'date': date,
            'content': content
        };
        var temps = [];
        for(var i=0;i<diarys.length;i++){
            if(diarys[i].date != date){
                temps.push(diarys[i]);
            }
        }
        temps.push(diary);
        this.diaryMap.put(from, temps);
    },
    getDiarys: function (id) {
        var from = Blockchain.transaction.from;
        var account = this.accounts.get(id);
        if(!account || account.from != from){
            throw new Error("未授权");
        }
        return this.diaryMap.get(from) || [];
    },
    register: function(id){
        if(id === "" || id.length != 32){
            throw new Error("未知错误！");
        }
        var from = Blockchain.transaction.from;
        var account = {
            "from": from,
            "ts": new Date().getTime()
        }
        this.accounts.put(id, account);
    }
};
module.exports = Chatroom;