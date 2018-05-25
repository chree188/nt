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

var ScoreColumn = function() {
	LocalContractStorage.defineMapProperty(this, "repo", {
		parse: function(text) {
			return new ScoreItem(text);
		},
		stringify: function(o) {
			return o.toString();
		}
	});
	LocalContractStorage.defineMapProperty(this, "arrayMap");
	LocalContractStorage.defineProperty(this, "mysize");
};
ScoreColumn.prototype = {
	init: function() {
		// todo
		this.mysize = 0;
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
		var index = this.size;
		this.arrayMap.set(index, from);
		this.repo.set(from, scoreItem);
		this.mysize = this.mysize + 1;
		return this.size;
	},
	len: function() {
		return this.size;
	},
	get: function(key) {
		key = key.trim();
		if(key === "") {
			throw new Error("empty key")
		}
		return this.repo.get(key);
	},

	getTop: function(value) {
		var result = "[";
		for(var i = 0; i < this.mysize; i++) {
			var key = this.arrayMap.get(i);
			var object = this.repo.get(key);
			result = result + object + ",";
		}
		result += "]";
		return result;

	},
	skip: function(value) {
		//		var value = Blockchain.transaction.value;
		//		if(value.parseFloat() >= 0.001) return true;
		//		else return false;
		return true;
	}
};
module.exports = ScoreColumn;