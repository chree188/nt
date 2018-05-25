"use strict";

var ScoreItem = function(text) {
	if(text) {
		var obj = JSON.parse(text);
		this.name = obj.name;
		this.score = obj.score;
		this.author = obj.author;
	} else {
		this.name = "";
		this.author = "";
		this.score = "";
	}
};

ScoreItem.prototype = {
	toString: function() {
		return JSON.stringify(this);
	}
};

var ScoreItem = function() {
	LocalContractStorage.defineMapProperty(this, "repo", {
		parse: function(text) {
			return new ScoreItem(text);
		},
		stringify: function(o) {
			return o.toString();
		}
	});
};

ScoreItem.prototype = {
	init: function() {
		// todo
	},

	save: function(name, score) {
		name = name.trim();
		score = score.trim();
		var from = Blockchain.transaction.from.toString().trim();
		var scoreItem = this.repo.get(from);
		if(scoreItem) {
			if(scoreItem.score > score) {
				return;
			}
		}
		scoreItem = new ScoreItem();
		scoreItem.score = score;
		scoreItem.name = name;
		scoreItem.author = from;
		var key = from.substr(0, 8);
		this.repo.put(key, scoreItem);

	},

	get: function(key) {
		key = key.trim();
		if(key === "") {
			throw new Error("empty key")
		}
		key = key.substr(0, 8);
		return this.repo.get(key);
	},

	getTop: function(value) {
		return JSON.stringify(this.repo.stringify());
	},
	skip: function(value) {
		//		var value = Blockchain.transaction.value;
		//		if(value.parseFloat() >= 0.001) return true;
		//		else return false;
		return true;
	}
};
module.exports = ScoreItem;