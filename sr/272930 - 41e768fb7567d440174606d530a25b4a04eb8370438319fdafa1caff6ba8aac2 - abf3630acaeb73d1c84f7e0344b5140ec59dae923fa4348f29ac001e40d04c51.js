"use strict";


var WishingWall = function () {};

WishingWall.prototype = {
    init: function () {},
    set: function (key, value) {
        this._set(key, value);
        this._set('allWishingWall-a-b-c', value, key);
    },
    _set: function (name, value, key) {
        var keys = key || name
        var defaultData = JSON.parse(LocalContractStorage.get(keys));
        var data = Object.prototype.toString.call(defaultData) == '[object Array]' ? defaultData : [];
        data.push({
            key: keys,
            value: value,
            time: Blockchain.transaction.timestamp
        });
        LocalContractStorage.del(name);
        LocalContractStorage.set(name, JSON.stringify(data));
    },
    getAll: function () {
        return LocalContractStorage.get('allWishingWall-a-b-c');
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
