"use strict";

var LovePair = function(text) {
	if (text) {
		var obj = JSON.parse(text);
        this.boy = obj.boy;
        this.girl = obj.girl;
        this.boyPass = obj.boyPass;
        this.girlPass = obj.girlPass;
        this.author = obj.author;
	} else {
        this.boy = "";
        this.girl = "";
        this.boyPass = "";
        this.girlPass = "";
        this.author = "";
	}
};

LovePair.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var LovePairConcact = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new LovePair(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

LovePairConcact.prototype = {
    init: function () {
        // todo
    },

    register: function (boy, girl, boyPass, girlPass) {
        if (boy === "" || girl === "" || boyPass === "" || girlPass === ""){
            throw new Error("invalid param");
        }
        var from = Blockchain.transaction.from;
        var boyData = this.repo.get(boy);
        var girlData = this.repo.get(girl);
        if (boyData){
            throw new Error("无法执行，男方在链上还有一段感情");
        }
        if (girlData){
            throw new Error("无法执行，女方在链上还有一段感情");
        }
        var p = new LovePair();
        p.author = from;
        p.boy = boy;
        p.girl = girl;
        p.boyPass = boyPass;
        p.girlPass = girlPass;
        this.repo.put(boy, p);
        this.repo.put(girl, p);
        this.repo.put(boy + girl, p);
        return "已完成登记";
    },

    breakUpPeacefully : function (boy, girl, boyPass, girlPass)  {
        if (boy === "" || girl === "" || boyPass === "" || girlPass === ""){
            throw new Error("invalid param");
        }
        var lastPair = this.repo.get(boy + girl);
        if(!lastPair){
            throw new Error("无法执行，链上没有配对的恋爱关系");
        }
        if(lastPair.boyPass !== boyPass || lastPair.girlPass !== girlPass){
            throw new Error("无法执行，双方密码错误");
        }
        var from = Blockchain.transaction.from;
        var boyData = this.repo.get(boy);
        if(boyData.author !== from){
            throw new Error("无法执行，您不是创建者");
        }
        this.repo.del(boy);
        this.repo.del(girl);
        this.repo.del(boy + girl);
        return "已完成登记";
    },

    hasPair : function (boyOrGirl) {
        boyOrGirl = boyOrGirl.trim();
        if ( boyOrGirl === "" ) {
            throw new Error("boyOrGirl empty")
        }
        if(this.repo.get(boyOrGirl)){
            return "很遗憾，对方还有恋爱关系在链上";
        }
        return "放心去追吧，对方没有恋爱关系在链上";
    }
};
module.exports = LovePairConcact;