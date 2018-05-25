"use strict";

// Contract address
// n1tFnKttYZ77dPmAYH7KzCrc99JASJ76gEb

// Hash
// 4c92673445804a894a90b5ac9fc39acc61f77b5d1a61767226f373af8bdde41f

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
        var stringTodos = this.repo.get(key);
        var todos = JSON.parse(stringTodos || '[]')
        todos.forEach(function (todo, index) {
            todo.id = index
        })
        return todos
    }
};

module.exports = TodoStorage;