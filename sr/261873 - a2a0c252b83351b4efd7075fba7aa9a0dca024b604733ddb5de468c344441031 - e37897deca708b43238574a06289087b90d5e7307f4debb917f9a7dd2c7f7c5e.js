"use strict";

var DiaryItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.key = obj.key;
        this.date = obj.date;
        this.weekday = obj.weekday;
        this.weather = obj.weather;
        this.content = obj.content;
        this.timestamp = obj.timestamp;
    } else {
        this.key = "";
        this.date = "";
        this.weekday = "";
        this.weather = "";
        this.content = "";
        this.timestamp = "";
    }
};

DiaryItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var diaryDictionary = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new DiaryItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

diaryDictionary.prototype = {
    init: function () {

    },

    add: function (weather, content) {
        var date = this.getDate();
        var weekday = this.getWeekday();
        var weather = weather.trim();
        var content = content.trim();
        if (date === "") {
            throw new Error("请输入日期");
        } else if (weekday === "") {
            throw new Error("请输入星期");
        } else if (weather === "") {
            throw new Error("请输入天气情况");
        } else if (content === "") {
            throw new Error("请输入日志内容");
        } else if (content.length > 520) {
            throw new Error("日志内容最多520个字符")
        }

        var from = Blockchain.transaction.from;
        var key = from + "_" + date;
        var diaryItem = this.repo.get(key);
        if (diaryItem) {
            throw new Error("今天已经写过日记啦");
        }

        diaryItem = new DiaryItem();
        diaryItem.key = key;
        diaryItem.date = date;
        diaryItem.weekday = weekday;
        diaryItem.weather = weather;
        diaryItem.content = content;
        diaryItem.timestamp = Blockchain.block.timestamp;
        this.repo.put(key, diaryItem);
    },
    get: function (date) {
        if (date === "") {
            throw new Error("请输入日期参数");
        }
        var from = Blockchain.transaction.from;
        var key = from + "_" + date;
        return this.repo.get(key);
    }, 
    getDate: function () {
        var today = new Date();
        return today.getFullYear() + "年" + (today.getMonth() + 1) + "月" + today.getDate() + "日";
    },
    getWeekday: function () {
        var today = new Date();
        var dateweek = "";
        switch (today.getDay()) {
            case 0: dateweek = "星期日"; break;
            case 1: dateweek = "星期一"; break;
            case 2: dateweek = "星期二"; break;
            case 3: dateweek = "星期三"; break;
            case 4: dateweek = "星期四"; break;
            case 5: dateweek = "星期五"; break;
            case 6: dateweek = "星期六"; break;
        }
        return dateweek;
    }
};
module.exports = diaryDictionary;