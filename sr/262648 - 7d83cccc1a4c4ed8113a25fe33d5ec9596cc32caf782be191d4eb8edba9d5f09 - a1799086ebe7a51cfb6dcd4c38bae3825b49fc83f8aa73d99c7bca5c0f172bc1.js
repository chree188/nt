"use strict";

var Item = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.key = obj.key;
		this.value = obj.value;
	} else {
	    this.key = "";
	    this.value = "";
	}
};

Item.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var JigSaw = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new Item(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

JigSaw.prototype = {
    init: function () {
        // todo
    },

    save: function (name, score) {

        name = name.trim();
        score = score.trim();
        if (name === "" || score === ""){
            throw new Error("empty name / score");
        }

        var from = Blockchain.transaction.from;
        var repoItem = this.repo.get('list');
        var list = [];
        if (repoItem && repoItem.value) {
            list = repoItem.value;
        }
        var date = new Date();
        var dayTime = date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
        list.push({
            name: name,
            score: score,
            author: from,
            date: dayTime,
        })

        repoItem = new Item();
        repoItem.key = 'list';
        repoItem.value = list;
        this.repo.set('list', repoItem);
    },

    get: function () {
        return this.repo.get('list');
    }
};
module.exports = JigSaw;
