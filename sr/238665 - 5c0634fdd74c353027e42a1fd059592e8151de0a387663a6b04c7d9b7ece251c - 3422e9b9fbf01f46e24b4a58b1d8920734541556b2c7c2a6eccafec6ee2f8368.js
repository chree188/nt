"use strict";

var TodoContent = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.content = obj
	} else {
        this.content = null
	}
};

TodoContent.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var TodoStorage = function() {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new TodoContent(text)
        },
        stringify: function (o) {
            return o.toString();
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