'use strict';

var UserInfo = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.name = obj.name;
        this.content = obj.content;
        this.order = obj.order;
    } else {
        // 昵称
        this.name = "";
        // 内容
        this.content = 0;
        // 次数
        this.order = 0;
    }
}

UserInfo.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var GameContract = function() {
    // 玩家数量
    LocalContractStorage.defineProperty(this, "userCount");
    // 玩家姓名
    LocalContractStorage.defineProperty(this, "userNames");
    // 玩家信息
    LocalContractStorage.defineMapProperty(this, "userPool", {
        parse: function(jsonText) {
            return new UserInfo(jsonText);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });
}

GameContract.prototype = {
    init: function() {
        this.userCount = 0;
        this.userNames = [];
    },
    save: function(name, content) {
        // 检查姓名是否存在
        // for (var i = 0; i < this.userNames.length; i++) {
        //     if (name == this.userNames[i]) {
        //         throw new Error("哇，这个姓名已经存在/(ㄒoㄒ)/~~");
        //     }
        // }
        this.userCount += 1
        var userInfo = new UserInfo()
        userInfo.name = name
        userInfo.content = content
        userInfo.order = this.userCount
        this.userPool.put(this.userCount, userInfo)
        return this.userCount
    },
    get: function() {
        var result = "[";
        for (var i = 1; i <= this.userCount; i++) {
            var object = this.userPool.get(i);
            result += object;
            if (i != this.userCount) {
                result += ","
            }
        }
        result += "]";
        return result;
    },
    test: function() {
        var d = new Date()
        return d
    }
};
module.exports = GameContract;