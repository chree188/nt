'use strict';

var UserInfo = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.name = obj.name;
        this.score = obj.score;
        this.order = obj.order;
    } else {
        // 昵称
        this.name = "";
        // 分数
        this.score = 0;
        // 次数
        this.order = 0;
    }
}

UserInfo.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var JumpContract = function() {
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

JumpContract.prototype = {
    init: function() {
        this.userCount = 0;
        this.userNames = [];
    },
    // 存入玩家信息
    save: function(name, score) {
        this.userCount += 1
        var userInfo = new UserInfo()
        userInfo.name = name
        userInfo.score = score
        userInfo.order = this.userCount
        this.userPool.put(this.userCount, userInfo)
        return this.userCount
    },
    // 获取玩家信息,并封装为json的字符串
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
    // 返回玩家数量
    getCount: function() {
        return this.userCount
    },
    // 彩蛋:(玩家分数*当前玩家数量)/1234为整数领取发红包
    egg: function(address, score) {
        // if(((this.userCount * score) % 1234) == 0 && (score != 0)) {
        //     var amount = new BigNumber(10000000000000000)
        //     var result = Blockchain.transfer(address, amount)
        //     return "恭喜你，你成功获取了彩蛋！"
        // }
        return "很遗憾，彩蛋没有砸中你！"
    }
};
module.exports = JumpContract;