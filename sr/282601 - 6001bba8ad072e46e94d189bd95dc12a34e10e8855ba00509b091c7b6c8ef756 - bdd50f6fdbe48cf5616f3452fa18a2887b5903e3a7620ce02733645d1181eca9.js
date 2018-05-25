"use strict";

var BlockChainDiary = function () {
    LocalContractStorage.defineMapProperty(this, "diaryMap");
    LocalContractStorage.defineMapProperty(this, "accounts");
    LocalContractStorage.defineProperty(this, "accountSize");
    LocalContractStorage.defineProperty(this, "diarySize");
};

BlockChainDiary.prototype = {
    init: function () {
    },
    postDiary: function (id, content, date) {
        var from = Blockchain.transaction.from;
        var account = this.accounts.get(from);
        if(!account || account.id != id){
            throw new Error("未授权, 请先绑定地址！");
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
        this.diarySize = this.diarySize - diarys.length + temps.length;
        this.diaryMap.put(from, temps);
    },
    getDiarys: function (id, from) {
        var account = this.accounts.get(from);
        if(!account || account.id != id){
            throw new Error("未授权, 请先绑定地址！");
        }
        return this.diaryMap.get(from) || [];
    },
    register: function(id){
        if(id === "" || id.length != 32){
            throw new Error("未知错误！");
        }
        var from = Blockchain.transaction.from;
        var account = {
            "id": id,
            "ts": new Date().getTime()
        }
        if(!this.accounts.get(from)){
            this.accountSize++;
        }
        this.accounts.put(from, account);
    },
    count: function(){
        return {
            'accountSize': this.accountSize,
            'diarySize': this.diarySize
        }
    }
};
module.exports = BlockChainDiary;