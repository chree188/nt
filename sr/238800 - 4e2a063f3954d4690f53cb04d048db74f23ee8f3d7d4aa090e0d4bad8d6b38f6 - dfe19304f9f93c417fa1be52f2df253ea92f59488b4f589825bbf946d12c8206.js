"use strict";

// Contract address
// n1h9hHx17qfRzRzbB1J3D1YyJR4vaeUnfSH

// Hash
// c3f10c84db004dabd2c37b851b84b1d3d0e5303df1bc9f91e026042d2fb4cd20

var TodoContent = function(obj) {
    this.content = obj
};

TodoContent.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};


var TodoStorage = function() {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            var objs = JSON.parse(text || '[]')
            var res = []
            for (var i = 0; i < objs.length; i++) {
                res.push(new TodoContent(objs[i]))
            }
            return res
        },
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
        todos = JSON.parse(todos || '[]')
        var res = []
        for (var i = 0; i < todos.length; i++) {
            res.push(new TodoContent(todos[i]))
        }

        this.repo.put(key, res);
    },

    get: function () {
        var key = Blockchain.transaction.from;
        return this.repo.get(key)
    }
};

module.exports = TodoStorage;