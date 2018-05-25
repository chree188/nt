"use strict";

var DictItem = function(text) {
    
};

var WishingWall = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new DictItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

WishingWall.prototype = {
    init: function () {
    
    },

    set: function (key, value) {
            var item = this.repo.get(key);
            var data = item ? JSON.parse(item) : [];
            data.push({
                key: key,
                value: value,
                time: Blockchain.transaction.timestamp
            });

            this.repo.put(key, JSON.stringify(data));
    },

    getWhole: function () {
        return JSON.stringify([])
    },

    get: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("empty key")
        }
        return this.repo.get(key);
    }
};
module.exports = WishingWall;
