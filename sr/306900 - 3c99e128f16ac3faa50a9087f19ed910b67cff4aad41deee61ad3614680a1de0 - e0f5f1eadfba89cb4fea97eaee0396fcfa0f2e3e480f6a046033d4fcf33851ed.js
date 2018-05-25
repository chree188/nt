"use strict";

var FormatItem = function () {
    /*if (text) {
        var obj = JSON.parse(text);
        this.score = obj.score;
        this.uptime = obj.uptime;
    } else {
        this.score = 0;
        this.uptime = 0;
    }*/
    this.score = 0;
    this.uptime = 0;
};

FormatItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var RankFormat = function () {
    this.address = 0;
    this.score = 0;
};
var NumFormat = function () {
    this.address = 0;
    this.count = 0;
};


var towerContract = function () {
    //用户存储
    /*LocalContractStorage.defineMapProperty(this, "userHistory", {
        parse: function (text) {
            return new FormatItem(text);
        },
        stringify: function (obj) {
            return obj.toString();
        }
    });*/
    //个人游戏记录
    LocalContractStorage.defineMapProperty(this, "userHistory");
    //得分排行榜
    LocalContractStorage.defineMapProperty(this, "scoreRank");
    //个人游戏次数
    LocalContractStorage.defineMapProperty(this, "countHistory");
    //游戏次数排行榜
    LocalContractStorage.defineMapProperty(this, "countNumRank");
};

towerContract.prototype = {
    init: function () {
        //
        this.mainAddress = Blockchain.transaction.from;
    },

    recordSave: function (sendTime, userScore) {
        if (!sendTime || !userScore) {
            return false;
        }
        var from = Blockchain.transaction.from;
        //定义用户成绩保存格式
        var deposit = new FormatItem();
        deposit.score = userScore;
        deposit.uptime = sendTime;
        //纪录个人成绩
        var userRecord = this.userHistory.get(from) || [];
        var recordNum = userRecord.length;
        userRecord[recordNum] = deposit;
        //userRecord = JSON.stringify(userRecord);
        //定义排行榜保存格式
        var randItem = new RankFormat();
        randItem.address = from;
        randItem.score = userScore;
        //纪录排行榜数据
        var userRank = this.scoreRank.get("top10") || [];
        var rankNum = userRank.length;
        if (rankNum < 10) {
            userRank[rankNum] = randItem;
        } else {
            if (userScore >= userRank[rankNum-1]) {
                userRank[rankNum-1] = randItem;
            }
        }
        //top10排序
        userRank = this._insertRank(userRank);
        //console.log("userRank:", userRank);

        //记录用户游戏次数
        //用户游戏次数存储
        var countNumber = this.countHistory.get(from) || new BigNumber(0);
        countNumber = new BigNumber(countNumber);
        var plusCount = countNumber.plus(1);
        //游戏次数榜格式
        var countItem = new NumFormat();
        countItem.address = from;
        countItem.count = plusCount;
        var countRank = this.countNumRank.get("countTop") || [];
        var numCount = countRank.length;
        var isInIt = false;
        for (var i = 0; i < numCount; i++) {
            if (countRank[i].address == from) {
                isInIt = true;
                countRank[i].count = plusCount;
            }
        }
        if (!isInIt) {
            if (numCount < 10) {
                countRank[numCount] = countItem;
            } else {
                if (plusCount >= countRank[numCount-1].count) {
                    countRank[numCount-1] = countItem;
                }
            }
        }
        countRank = this._insertCount(countRank);

        //保存个人成绩
        this.userHistory.set(from, userRecord);

        //保存排行榜成绩
        this.scoreRank.set("top10", userRank);
        //保存个人游戏次数
        this.countHistory.set(from, plusCount);
        //保存次数排行榜信息
        this.countNumRank.set("countTop", countRank);
    },

    getUserHistory: function () {
        var from = Blockchain.transaction.from;
        var historyRecord = this.userHistory.get(from);
        if (historyRecord) {
            return historyRecord;
        } else {
            return false;
        }
    },

    getScoreRank: function () {
        var topList = this.scoreRank.get("top10");
        if (topList) {
            return topList;
        } else {
            return false;
        }
    },
    getCountRank: function () {
        var countList = this.countNumRank.get("countTop");
        if (countList) {
            return countList;
        } else {
            return false;
        }
    },
    getUserCount: function () {
        var from = Blockchain.transaction.from;
        var historyRecord = this.countHistory.get(from);
        if (historyRecord) {
            return historyRecord;
        } else {
            return false;
        }
    },

    _insertRank : function(arr) {
        var len = arr.length;
        for (var i = 1; i < len; i++) {
            var key = parseFloat(arr[i].score),
                itemKey = arr[i];
            var j = i - 1;
            while (j >= 0 && parseFloat(arr[j].score) < key) {
                arr[j + 1] = arr[j];
                j--;
            }
            arr[j + 1] = itemKey;
        }
        return arr;
    },
    _insertCount : function(arr) {
        var len = arr.length;
        for (var i = 1; i < len; i++) {
            var key = parseInt(arr[i].count),
                itemKey = arr[i];
            var j = i - 1;
            while (j >= 0 && parseInt(arr[j].count) < key) {
                arr[j + 1] = arr[j];
                j--;
            }
            arr[j + 1] = itemKey;
        }
        return arr;
    }
};


module.exports = towerContract;