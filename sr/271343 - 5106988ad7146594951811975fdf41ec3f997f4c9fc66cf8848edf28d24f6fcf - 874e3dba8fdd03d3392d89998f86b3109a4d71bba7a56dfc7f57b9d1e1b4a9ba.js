"use strict";

var WishingWall = function () {
    
};

WishingWall.prototype = {
    init: function () {
    
    },

    set: function (key, value) {
            var item = LocalContractStorage.get(key);
            var data = item ? JSON.parse(item) : [];
            data.push({
                key: key,
                value: value,
                time: Blockchain.transaction.timestamp
            });

            LocalContractStorage.put(key, JSON.stringify(data));
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
