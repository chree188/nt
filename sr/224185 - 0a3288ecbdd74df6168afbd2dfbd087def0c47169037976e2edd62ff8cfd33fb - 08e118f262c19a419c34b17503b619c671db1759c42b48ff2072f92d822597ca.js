'use strict';

var StorageContract = function () {};

StorageContract.prototype = {
    init: function () {
        console.log("storage init ...")
    },

    set: function (name, value) {
        LocalContractStorage.set(name, value);
        console.log("name === " + name);
        return "save success";
    },

    get: function (name) {
        var value = LocalContractStorage.get(name);
        console.log("get " + name + " = " + value);
        return value
    },

    del: function (name) {
        var result = LocalContractStorage.del(name);
        console.log("del " + name + " = " + result);

        return "del success";
    }
};

module.exports = StorageContract;