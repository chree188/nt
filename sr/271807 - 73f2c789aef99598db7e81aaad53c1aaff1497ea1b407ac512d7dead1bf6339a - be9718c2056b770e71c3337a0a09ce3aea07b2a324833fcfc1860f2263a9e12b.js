"use strict";


var WishingWall = function () {};

WishingWall.prototype = {
    init: function () {
        this.num = 0
    },
    set: function (key, value) {
            var defaultData = JSON.parse(LocalContractStorage.get(key));
            var data = Object.prototype.toString.call(defaultData) == '[object Array]' ? defaultData : [];
            data.push({
                key: key,
                value: value,
                time: Blockchain.transaction.timestamp
            });
            LocalContractStorage.del(key);
            LocalContractStorage.set(key, JSON.stringify(data));
            this.num = this.num + 1;
            LocalContractStorage.del('WishingWall' + this.num);
            LocalContractStorage.set('WishingWall' + this.num, JSON.stringify(data));
    },
    getWhole: function () {
        var getWholeArr = [];
        for (var i = this.num; i > 0; i--) {
            var item = JSON.parse(LocalContractStorage.get('WishingWall' + i));
            if (Object.prototype.toString.call(item) == '[object Array]') {
                getWholeArr.push(item)
            }
        }
        return JSON.stringify([])
    },
    get: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("empty key")
        }
        return LocalContractStorage.get(key);
    }
};
module.exports = WishingWall;
