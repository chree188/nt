'use strict';

var UserInfo = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.address = obj.address;
        this.gameId = obj.gameId;
        this.gameTime = obj.gameTime;
        this.gameName = obj.gameName;
        this.gameInfo = obj.gameInfo;
        this.order = obj.order;
    } else {
        this.address = "";
        // 游戏id
        this.gameId = "";
        // 游戏时间
        this.gameTime = "";
        // 游戏名称
        this.gameName = "";
        // 游戏信息
        this.gameInfo = "";
        // 开黑顺序(用于展示所有最新的开黑信息)
        this.order = 0;
    }
}

UserInfo.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var GangUpContract = function() {
    // 玩家数量
    LocalContractStorage.defineProperty(this, "userCount");
    // 带条件的玩家数量
    LocalContractStorage.defineProperty(this, "userCountCondition");
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

GangUpContract.prototype = {
    init: function() {
        this.userCount = 0
        this.userCountCondition = 0
        // todo
        var userInfo = new UserInfo()
        userInfo.address = "1234"
        userInfo.gameId = "faker"
        userInfo.gameInfo = "我压缩超6~"
        userInfo.gameTime = "2018-05-22"
        userInfo.gameName = "英雄联盟"
        userInfo.order = 1
        this.userPool.put(1, userInfo)
        userInfo.gameTime = "2018-05-20"
        userInfo.gameName = "英雄联盟"
        userInfo.order = 2
        this.userPool.put(2, userInfo)
        userInfo.gameTime = "2018-05-22"
        userInfo.gameName = "其他"
        userInfo.order = 3
        this.userPool.put(3, userInfo)
        userInfo.gameTime = "2018-05-22"
        userInfo.gameName = "王者荣耀"
        userInfo.order = 4
        this.userPool.put(4, userInfo)
        userInfo.gameTime = "2018-05-22"
        userInfo.gameName = "王者荣耀"
        userInfo.order = 5
        this.userPool.put(5, userInfo)
        this.userCount = 5
    },
    // 存入开黑信息 address:表示玩家的钱包地址
    // ["n1UkAUx38FpEdP1je2Hdyf4L7ZU2LtRjMX9", "kkk", "2018-05-20", "lol", "我压缩超6"]
    save: function(address, gameId, gameTime, gameName, gameInfo) {
        this.userCount += 1
        var userInfo = new UserInfo()
        userInfo.address = address
        userInfo.gameId = gameId
        userInfo.gameTime = gameTime
        userInfo.gameName = gameName
        userInfo.gameInfo = gameInfo
        userInfo.order = this.userCount
        this.userPool.put(this.userCount, userInfo)
        return this.userCount
    },
    // 获取所有开黑信息(不带条件查询),并封装为json的字符串
    get: function() {
        var result = "[";
        for (var i = 1; i <= this.userCount; i++) {
            var object = this.userPool.get(i);
            result += object;
            result += ","
        }
        if (result.length > 1) {
            result = result.slice(0, result.length - 1)
        }
        result += "]";
        return result;
    },
    // 根据页码和页的大小查询(由于最新的要最先展示，所以得倒序遍历)
    getInfoByOffset: function(offset, limit) {
        var start = this.userCount - offset * limit
        var end = this.userCount - (offset + 1) * limit
        if (end < 1) {
            end = 0;
        }
        var result = "[";
        for (var i = start; i > end; i--) {
            var object = this.userPool.get(i);
            result += object;
            result += ","
        }
        if (result.length > 1) {
            result = result.slice(0, result.length - 1)
        }
        result += "]";
        return result;
    },
    // 根据时间和游戏名称查询开黑信息
    getInfoByTimeAndName: function(offset, limit, gameTime, gameName) {
        var start = this.userCount - offset * limit
        var end = this.userCount - (offset + 1) * limit
        if (end < 1) {
            end = 0;
        }
        var result = "[";
        for (var i = start; i > end; i--) {
            var text = this.userPool.get(i);
            var obj = JSON.parse(text);
            if (gameTime != "" && obj.gameTime.split(" ")[0] != gameTime) {
                // 游戏时间不为空且不相等
                continue
            }
            if (gameName != "" && obj.gameName != gameName) {
                // 游戏名称不为空且不相等
                continue
            }
            result += text;
            result += ","
        }
        if (result.length > 1) {
            result = result.slice(0, result.length - 1)
        }
        result += "]";
        return result;
    },
    // 根据用户钱包地址、开黑时间、游戏名称获取开黑信息
    getInfoByCondition: function(offset, limit, address, gameTime, gameName) {
        var c = [];
        for (var i = 1; i <= this.userCount; i++) {
            var text = this.userPool.get(i);
            var obj = JSON.parse(text);
            if (address != "" && new String(obj.address).indexOf(address) < 0) {
                continue
            }
            if (gameTime != "" && new String(obj.gameTime.split(" ")[0]).indexOf(gameTime) < 0) {
                continue
            }
            if (gameName != "" && new String(obj.gameName).indexOf(gameName) < 0) {
                continue
            }
            c.push(text);
        }
        var count = c.length
        if(count == 0) {
            return "[]";
        }
        var start = count - offset * limit
        var end = count - (offset + 1) * limit
        if (end < 1) {
            end = 0;
        }
        var result = "[";
        for (var i = start - 1; i >= end; i--) {
            var text = c[i];
            var obj = JSON.parse(text);
            if (address != "" && new String(obj.address).indexOf(address) < 0) {
                continue
            }
            if (gameTime != "" && new String(obj.gameTime.split(" ")[0]).indexOf(gameTime) < 0) {
                continue
            }
            if (gameName != "" && new String(obj.gameName).indexOf(gameName) < 0) {
                continue
            }
            result += text;
            result += ","
        }
        if (result.length > 1) {
            result = result.slice(0, result.length - 1)
        }
        result += "]";
        return result;
    },
    // 返回开黑信息数量
    getCount: function() {
        return this.userCount
    },
    // 根据条件查询开黑条数
    getCountByCondition: function(address, gameTime, gameName) {
        var count = 0
        for (var i = 1; i <= this.userCount; i++) {
            var text = this.userPool.get(i);
            var obj = JSON.parse(text);
            if (address != "" && new String(obj.address).indexOf(address) < 0) {
                continue
            }
            if (gameTime != "" && new String(obj.gameTime.split(" ")[0]).indexOf(gameTime) < 0) {
                continue
            }
            if (gameName != "" && new String(obj.gameName).indexOf(gameName) < 0) {
                continue
            }
            count += 1
        }
        return count
    }
};
module.exports = GangUpContract;