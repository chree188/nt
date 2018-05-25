"use strict";

var InsContract = function () {
    LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineMapProperty(this, "dataMap");
    LocalContractStorage.defineProperty(this, "size");
};

InsContract.prototype = {
    init: function () {
        this.size = 0;
    },
    //key:id  value:?*id-pName-name
    set: function (key, value) {
        var index = this.size;
        this.arrayMap.set(index, key);
        this.dataMap.set(key, value);
        this.size += 1;
    },

    get: function (key) {
        return this.dataMap.get(key);
    },

    len: function () {
        return this.size;
    },

    forEach: function (limit, offset) {
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (offset > this.size) {
            throw new Error("offset is not valid");
        }
        var number = offset + limit;
        if (number > this.size) {
            number = this.size;
        }
        var result = "";
        for (var i = offset; i < number; i++) {
            var key = this.arrayMap.get(i);
            var object = this.dataMap.get(key);
            result += key + "*" + object + "^";
        }
        return result;
    }
};

module.exports = InsContract;