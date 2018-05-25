"use strict";


var WishingWall = function () {};

WishingWall.prototype = {
    init: function () {},
    set: function (key, value) {
        var defaultData = JSON.parse(LocalContractStorage.get(key));
        var data = Object.prototype.toString.call(defaultData) == '[object Array]' ? defaultData : [];
        var time = Blockchain.transaction.timestamp;
        data.push({
            key: key,
            value: value,
            time: time
        });
        if (data.length > 1) {
            LocalContractStorage.del(key);
        };
        LocalContractStorage.set(key, JSON.stringify(data));


        var defaultAllData = JSON.parse(LocalContractStorage.get('allWishingWall-a-b-c'));
        var allData = Object.prototype.toString.call(defaultAllData) == '[object Array]' ? defaultAllData : [];
        allData.push({
            key: key,
            value: value,
            time: time
        });
        if (allData.length > 1) {
            LocalContractStorage.del('allWishingWall-a-b-c');
        };
        LocalContractStorage.set('allWishingWall-a-b-c', JSON.stringify(allData));
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
