"use strict";

var Water = function () {
    LocalContractStorage.defineMapProperty(this, "repo");
};

Water.prototype = {
    init: function () {
    },

    save: function (value) {

        var from = Blockchain.transaction.from;
        value = value.trim();
        if (value === "") {
            throw new Error("empty key / value");
        }

        this.repo.put(from, value);
    },
    get: function () {

        var from = Blockchain.transaction.from;

        return this.repo.get(from);
    }
};
module.exports = Water;