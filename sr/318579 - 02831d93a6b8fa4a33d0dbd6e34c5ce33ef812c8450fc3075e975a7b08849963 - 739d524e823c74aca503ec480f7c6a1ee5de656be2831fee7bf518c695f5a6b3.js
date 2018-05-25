"use strict";

var TimeCapsule = function(text) {
	if (text) {
        var obj = JSON.parse(text);
        this.author = obj.author;
        this.key = obj.key;
        this.title = obj.title;
        this.content = obj.content;
        this.tips = obj.tips;
        this.expiredTime = obj.expiredTime;
	} else {
        this.author = "";
        this.key = "";
        this.title = "";
        this.content = "";
        this.tips = "";
        this.expiredTime = 0;
	}
};

TimeCapsule.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var TimeCapsuleConcact = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new TimeCapsule(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineProperty(this, "currentCount"); //提交胶囊次数
    LocalContractStorage.defineProperty(this, "currentViewedCount"); //打开胶囊次数
};

TimeCapsuleConcact.prototype = {
    init: function () {
        this.currentCount = 0;
        this.currentViewedCount = 0;
    },

    add: function (key, title, content, tips , expiredTime) {
        if (key === "" || title === "" || content === "" || expiredTime === 0){
            throw new Error("参数错误");
        }
        var from = Blockchain.transaction.from;
        var exitst = this.repo.get(key);
        if (exitst){
            throw new Error("key: " + key + "已经存在" );
        }
        var p = new TimeCapsule();
        p.author = from;
        p.key = key;
        p.title = title;
        p.content = content;
        p.tips = tips;
        p.expiredTime = expiredTime;
        this.repo.put(key, p);
        this.currentCount++;
        return "时光胶囊已完成登记";
    },

    delete : function (key)  {
        if (key === ""){
            throw new Error("key不能为空");
        }
        var lastTimeCapsule = this.repo.get(key);
        if(!lastTimeCapsule){
            return "找不到对应的时光胶囊";
        }
        if(lastTimeCapsule.author !== Blockchain.transaction.from){
            return "您不是创建者,无法销毁";
        }
        this.repo.del(key);
        return "时光胶囊已成功销毁";
    },

    query : function (key) {
        if (key === ""){
            throw new Error("key不能为空");
        }
        var lastTimeCapsule = this.repo.get(key);
        var ctTs = Blockchain.transaction.timestamp;
        if(!lastTimeCapsule){
            return "找不到对应的时光胶囊";
        }
        if(lastTimeCapsule.expiredTime > ctTs){
            if(lastTimeCapsule.tips){
                return lastTimeCapsule.tips;
            }
            return "该时光胶囊还没到解封时间";
        }
        this.currentViewedCount++;
        return lastTimeCapsule;
    },

    info : function () {
        return {currentCount:this.currentCount, currentViewedCount :this.currentViewedCount};
    }
};
module.exports = TimeCapsuleConcact;