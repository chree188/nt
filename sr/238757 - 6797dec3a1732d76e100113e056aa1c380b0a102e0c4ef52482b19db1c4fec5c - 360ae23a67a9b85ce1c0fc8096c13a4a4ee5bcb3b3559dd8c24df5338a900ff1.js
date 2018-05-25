"use strict";

var TodoContent = function(obj) {
    var obj = JSON.parse(text);

    for (var k in obj) {
        this[k] = obj[k]
    }
};


var TodoStorage = function() {
    LocalContractStorage.defineMapProperty(this, "repo", {
        stringify: function (o) {
            return o.toString()
        }
    });
};

TodoStorage.prototype = {
    init: function () {
    },

    save: function (todos) {
        var key = Blockchain.transaction.from;
        this.repo.put(key, todos);
    },

    get: function () {
        var key = Blockchain.transaction.from;
        return this.repo.get(key)
    }
};

module.exports = TodoStorage;