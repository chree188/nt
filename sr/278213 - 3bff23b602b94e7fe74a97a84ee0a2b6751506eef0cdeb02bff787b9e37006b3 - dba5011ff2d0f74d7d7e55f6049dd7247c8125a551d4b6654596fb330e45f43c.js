"use strict";

var SimpleContract = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (str) {
            return JSON.parse(str);
        },
        stringify: function (o) {
            return JSON.stringify(o);
        }
    });
};

SimpleContract.prototype = {
    init: function () {
        // todo
    },

    set: function (value) {

        value = value.trim();
        if (value === ""){
            throw new Error("empty value");
        }

        var from = Blockchain.transaction.from;
        this.repo.put(from, value);
    },

    get: function () {
        var from = Blockchain.transaction.from;
        return this.repo.get(from);
    }
};
module.exports = SimpleContract;