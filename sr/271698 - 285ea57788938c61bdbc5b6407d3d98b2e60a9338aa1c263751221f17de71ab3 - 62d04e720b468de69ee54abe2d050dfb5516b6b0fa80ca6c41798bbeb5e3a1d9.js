"use strict";


var WishingWall = function () {};

WishingWall.prototype = {
    init: function () {},
    set: function (key, value) {
            var defaultData = JSON.parse(LocalContractStorage.get(key));

            var data = Object.prototype.toString.call(defaultData) == '[object Array]' ? defaultData : [];

            data.push({
                key: key,
                value: value,
                time: Blockchain.transaction.timestamp.toString(10)
            });
            LocalContractStorage.del(key);
            LocalContractStorage.set(key, JSON.stringify(data));
    },
    getWhole: function () {
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
