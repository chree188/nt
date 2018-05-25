"use strict";

var TodoStorage = function() {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return JSON.parse(text);
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
        var todos = this.repo.get(key) || [];
        todos.forEach(function (todo, index) {
            todo.id = index
        })
        return todos
    }
};

module.exports = TodoStorage;