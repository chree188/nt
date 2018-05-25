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


var towerContract = function () {
    //用户存储
    /*LocalContractStorage.defineMapProperty(this, "userSave", {
        parse: function (text) {
            return new FormatItem(text);
        },
        stringify: function (obj) {
            return obj.toString();
        }
    });*/
    LocalContractStorage.defineMapProperty(this, "userSave");
    //排行榜
    LocalContractStorage.defineMapProperty(this, "topRank");
    /*//中奖纪录
    LocalContractStorage.defineMapProperty(this, "luckySave", {
    });*/
};

towerContract.prototype = {
    init: function () {
        //
        this.mainAddress = Blockchain.transaction.from;
    },
    
    save: function (sendTime, userScore) {
        if (!sendTime || !userScore) {
            return false;
        }
        var from = Blockchain.transaction.from;
        //定义用户成绩保存格式
        var deposit = new FormatItem();
        deposit.score = userScore;
        deposit.uptime = sendTime;
        //纪录个人成绩
        var userRecord = this.userSave.get(from) || [];
        var recordNum = userRecord.length;
        userRecord[recordNum] = deposit;
        //userRecord = JSON.stringify(userRecord);
        //定义排行榜保存格式
        var randItem = new RankFormat();
        randItem.address = from;
        randItem.score = userScore;
        //纪录排行榜数据
        var userRank = this.topRank.get("top10") || [];
        var rankNum = userRank.length;
        if (userRank.length < 10) {
            userRank[rankNum] = randItem;
        } else {
            if (userScore >= userRank[rankNum-1]) {
                userRank[rankNum-1] = randItem;
            }
        }
        //top10排序
        userRank = this._insertRank(userRank);
        //console.log("userRank:", userRank);
        //保存个人成绩
        this.userSave.set(from, userRecord);

        //保存排行榜成绩
        this.topRank.set("top10", userRank);
    },

    getUserRecord: function () {
        var from = Blockchain.transaction.from;
        var historyRecord = this.userSave.get(from);
        if (historyRecord) {
            return historyRecord;
        } else {
            return false;
        }
    },

    getTopList: function () {
        var topList = this.topRank.get("top10");
        if (topList) {
            return topList;
        } else {
            return false;
        }
    },

    _insertRank : function(arr) {
        var len = arr.length;
        for (var i = 1; i < len; i++) {
            var key = arr[i].score,
                itemKey = arr[i];
            var j = i - 1;
            while (j >= 0 && arr[j].score > key) {
                arr[j + 1] = arr[j];
                j--;
            }
            arr[j + 1] = itemKey;
        }
        return arr;
    }
};


module.exports = towerContract;