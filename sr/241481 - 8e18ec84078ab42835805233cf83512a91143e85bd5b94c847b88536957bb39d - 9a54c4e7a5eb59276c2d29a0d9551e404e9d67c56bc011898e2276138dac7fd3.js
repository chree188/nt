"use strict";

var date = new Date();
var month = parseInt(date.getMonth()) + 1;
var year = date.getFullYear();

var Item = function (id, amount, type, remark) {
    this.id = id;
    this.amount = amount;
    this.type = type;
    this.remark = remark;
    this.time = date.toString();
};

Item.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
}

var System = function () {
    this.users = [];
    this.userCount = 0;
    this.itemCount = 0;
};

System.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
}

System.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
}

var Summary = function () {
    this.date = date.getDate();
    this.count = 0;
    this.income = 0;
    this.payout = 0;
    this.lastMonth = month;
    this.lastYear = year;
};

Summary.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
}

var YearSummary = function (year) {
    this.year = year;
    this.income = 0;
    this.payout = 0;
    this.cursor = 0;
    this.length = 0;
};

var MonthSummry = function (year, month) {
    this.year = year;
    this.month = month;
    this.income = 0;
    this.payout = 0;
    this.cursor = 0;
    this.length = 0;
};

function dateKey(from) {
    return from + '-date';
}

function summaryKey(from) {
    return from + '-summary';
}

function summaryYearKey(from, year) {
    return from + '-summary-' + year;
}

function summaryMonthKey(from, year, month) {
    return from + '-summary-' + year + '-' + month;
}

function getSummary(from) {
    var key = summaryKey(from);
    return LocalContractStorage.get(key);
}

function mapToJson(map) {
    return JSON.stringify([...map]);
}

function jsonToMap(jsonStr) {
    return new Map(JSON.parse(jsonStr));
}

function isString(str){ 
    return (typeof str == 'string') && str.constructor == String; 
}

function isArray(o){
    return Object.prototype.toString.call(o) == '[object Array]';
}

function checkType(type) {
    if (type == "income" || type == "payout") {
        return;
    }
    throw new Error("type must in `income` or `payout`");
}

function checkAmount(amount) {
    if (isNaN(amount)) {
        throw new Error("amount must be number");
    }
    if (amount < 0) {
        throw new Error("amount must be greater than 0");
    }
}

/**
 * Summary
 * @param  adress from
 * @param  enum('income', 'payout') type
 * @param  float amount
 * @return Summary
 */
function UserSummary(from, type, amount) {
    var key = summaryKey(from);
    var summary = LocalContractStorage.get(key);
    if (!summary) {
        summary = new Summary();
    }
    if (type == 'income') {
        summary.income += amount;
    } else {
        summary.payout += amount;
    }
    summary.count++;

    return summary;
}

/**
 * Summary by year
 * @param  adress from
 * @param  enum('income', 'payout') type
 * @param  float amount
 * @return YearSummary
 */
function UserSummaryYear(from, type, amount) {
    var cursor = 0;
    var lastYear = year;

    var summary = getSummary(from);
    if (summary) {
        lastYear = summary.lastYear;
        cursor = summary.count - 1;
    }

    var key = summaryYearKey(from, lastYear);
    var yearSummary = LocalContractStorage.get(key);
    if (!yearSummary) {
        yearSummary = new YearSummary(lastYear);
        yearSummary.cursor = cursor;
    }
    yearSummary.length++;

    if (type == 'income') {
        yearSummary.income += amount;
    } else {
        yearSummary.payout += amount;
    }

    return yearSummary;
}

/**
 * Summary by month
 * @param  adress from
 * @param  enum('income', 'payout') type
 * @param  float amount
 * @return YearSummary
 */
function UserSummaryMonth(from, type, amount) {
    var cursor = 0;
    var lastMonth = month;
    var lastYear = year;

    var summary = getSummary(from);
    if (summary) {
        lastMonth = summary.lastMonth;
        lastYear = summary.lastYear;
        cursor = summary.count - 1;
    }

    var key = summaryMonthKey(from, lastYear, lastMonth);
    var monthSummry = LocalContractStorage.get(key);
    if (!monthSummry) {
        monthSummry = new MonthSummry(lastYear, lastMonth);
        monthSummry.cursor = cursor;
    }
    monthSummry.length++;

    if (type == 'income') {
        monthSummry.income += amount;
    } else {
        monthSummry.payout += amount;
    }

    return monthSummry;
}

/**
 * Date manage
 * @param address from
 * @param Summary summary
 */
function Dates(from, summary) {
    var key = dateKey(from);
    var dates = LocalContractStorage.get(key);
    if (dates) {
        dates = jsonToMap(dates);
    } else {
        dates = new Map();
    }
    var months = dates.get(summary.lastYear);
    if (months) {
        months = new Set(months);
    } else {
        months = new Set();
    }
    months.add(summary.lastMonth);

    var monthArray = [];
    months.forEach(function (month) {
        monthArray.push(month);
    });
    dates.set(summary.lastYear, monthArray);

    return dates;
}

/**
 * Save item
 * 
 * @param  adress from
 * @param  enum('income', 'payout') type
 * @param  float amount
 * @param  string remark
 * @return Item Array
 */
function Items(from, type, amount, remark) {
    var summarykey = summaryKey(from);
    var summary = LocalContractStorage.get(summarykey);
    var id = 0;
    if (summary) {
        id = summary.count;
    }
    var item = new Item(id, amount, type, remark);
    var items = LocalContractStorage.get(from);
    if (!items) {
        items = [];
    }
    items.push(item);

    return items;
}

function paginte(offset, limit) {
    offset = parseInt(offset);
    limit = parseInt(limit);
    if (offset < 0) {
        offset = 0;
    }
    if (limit == 0) {
        limit = 50;
    }

    return {
        offset: offset,
        limit: limit
    };
}

/**
 * Update system info
 * @param  address from
 * @return System
 */
function updateSystemData(from) {
    var system = LocalContractStorage.get('system');
    var users = new Set();
    if (system) {
        users = new Set(system.users);
    } else {
        system = new System();
    }
    users.add(from);

    var sysUsers = [];
    users.forEach(function (user) {
        sysUsers.push(user);
    });
    system.users = sysUsers;
    system.userCount = sysUsers.length;
    system.itemCount++;

    return system;
}

var AccountBook = function () {};

AccountBook.prototype = {
    init: function () {},

    save: function (amount, type, remark) {
        amount = parseFloat(amount);
        checkType(type);
        checkAmount(amount);

        var from = Blockchain.transaction.from;
        var summarykey = summaryKey(from);
        var datekey = dateKey(from);
        var yearKey = summaryYearKey(from, year);
        var monthKey = summaryMonthKey(from, year, month);

        var items = Items(from, type, amount, remark);
        var summary = UserSummary(from, type, amount);
        var monthSummry = UserSummaryMonth(from, type, amount);
        var yearSummary = UserSummaryYear(from, type, amount);
        var dates = Dates(from, summary);
        var system = updateSystemData(from);

        LocalContractStorage.del(from);
        LocalContractStorage.set(from, items);

        LocalContractStorage.del(summarykey);
        LocalContractStorage.set(summarykey, summary);

        LocalContractStorage.del(monthKey);
        LocalContractStorage.set(monthKey, monthSummry);

        LocalContractStorage.del(yearKey);
        LocalContractStorage.set(yearKey, yearSummary);

        LocalContractStorage.del(datekey);
        LocalContractStorage.set(datekey, mapToJson(dates));

        LocalContractStorage.del('system');
        LocalContractStorage.set('system', system);
    },

    get: function (offset, limit) {
        var page = paginte(offset, limit);
        var end = page.offset + page.limit;

        var items = [];
        var userItems = LocalContractStorage.get(Blockchain.transaction.from);

        if (!userItems) {
            return {
                data: items,
                cursor: 0,
                count: 0,
                total: 0
            };
        }
        if (page.limit > 0) {
            for (var i = page.offset; i < end; i++) {
                if (userItems[i]) {
                    items.push(userItems[i]);
                }
            }
        } else {
            for (var i = page.offset; i >= end; i--) {
                if (userItems[i]) {
                    items.push(userItems[i]);
                }
            }
        }

        return {
            data: items,
            cursor: end,
            count: items.length,
            total: this.count()
        };
    },

    count: function () {
        var key = summaryKey(Blockchain.transaction.from)
        var summary = LocalContractStorage.get(key);
        var count = 0;
        if (summary) {
            count = summary.count;
        }
        return count;
    },

    dates: function () {
        var key = dateKey(Blockchain.transaction.from);
        var dates = LocalContractStorage.get(key);

        return dates;
    },

    summaryYear: function (year) {
        var key = summaryYearKey(Blockchain.transaction.from, year);
        return {
            data: LocalContractStorage.get(key)
        };
    },

    yearItems: function (year) {
        var key = summaryYearKey(Blockchain.transaction.from, year);
        var summary = LocalContractStorage.get(key);

        if (!summary) {
            return {
                data: [],
                summary: {}
            };
        }

        var yearItems = [];
        var items = LocalContractStorage.get(Blockchain.transaction.from);
        var length = summary.cursor + summary.length;
        for (var i = summary.cursor; i <= length; i++) {
            yearItems.push(items[i]);
        }

        return {
            data: yearItems,
            summary: summary
        };
    },

    summaryMonth: function (year, month) {
        var key = summaryMonthKey(Blockchain.transaction.from, year, month);
        return {
            data: LocalContractStorage.get(key)
        };
    },

    monthItems: function (year, month) {
        var key = summaryMonthKey(Blockchain.transaction.from, year, month);
        var summary = LocalContractStorage.get(key);

        if (!summary) {
            return {
                data: [],
                summary: {}
            };
        }

        var monthItems = [];
        var length = summary.length + summary.cursor;
        var items = LocalContractStorage.get(Blockchain.transaction.from);
        for (var i = summary.cursor; i < length; i++) {
            monthItems.push(items[i]);
        }

        return {
            data: monthItems,
            summary: summary
        };
    },

    system: function () {
        var system = LocalContractStorage.get('system');
        if (system) {
            return {
                user_count: system.userCount,
                item_count: system.itemCount
            };
        }
        return {
            user_count: 0,
            item_count: 0
        };
    }
};
module.exports = AccountBook;
