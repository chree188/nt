'use strict';

var DayCheckItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.day = obj.day;
        this.author = obj.author;
        this.total = obj.total;
    } else {
        this.day = "[]";
        this.author = "";
        this.total = 0;
    }
};

DayCheckItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

function lastCheckDay(dayArr) {
    var len = dayArr.length;
    if (len <= 0) {
        return 0;
    } else {
        return dayArr[len - 1].day;
    }
}

var SignInContract = function () {
    LocalContractStorage.defineMapProperty(this, 'dayCheckDB', {
        parse: function (str) {
            return new DayCheckItem(str);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};
SignInContract.prototype = {
    init: function () {},
    signIn: function (day, tip) {
        day = day.trim();
        tip = tip.trim();
        var from = Blockchain.transaction.from;
        var height = new BigNumber(Blockchain.block.height);
        var dayCheck = this.dayCheckDB.get(from);
        if (!dayCheck) {
            dayCheck = new DayCheckItem(null)
        }
        var newDay = parseInt(day);
        var dayArr = JSON.parse(dayCheck.day);
        var oldDay = lastCheckDay(dayArr)
        if (newDay <= oldDay) {
            throw new Error('Already Sign in today.(今日已签到！)');
        }
        dayCheck.total = dayCheck.total + 1
        dayArr.push({
            day: newDay,
            tip: tip
        });
        dayCheck.day = JSON.stringify(dayArr)
        dayCheck.author = from;
        this.dayCheckDB.put(from, dayCheck);
    },
    dayOfSignIn: function () {
        var from = Blockchain.transaction.from;
        var dayCheck = this.dayCheckDB.get(from);
        if (!dayCheck) {
            dayCheck = new DayCheckItem(null)
        }
        return dayCheck ? dayCheck.toString() : '';
    }
}

module.exports = SignInContract;