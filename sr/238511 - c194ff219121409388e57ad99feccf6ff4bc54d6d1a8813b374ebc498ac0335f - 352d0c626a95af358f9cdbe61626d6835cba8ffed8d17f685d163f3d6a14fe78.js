"use strict";

var TodoStorage = function() {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return text;
        },
        stringify: function (o) {
            return o;
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
        var stringTodos = this.repo.get(key);
        var todos = JSON.parse(stringTodos || '[]')
        todos.forEach(function (todo, index) {
            todo.id = index
        })
        return todos
    }
};

module.exports = TodoStorage;