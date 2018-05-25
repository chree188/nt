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
	LocalContractStorage.defineProperty(this, "size");
};
var compare = function(prop) {
	return function(obj1, obj2) {
		var val1 = obj1[prop];
		var val2 = obj2[prop];
		if(val1 < val2) {
			return -1;
		} else if(val1 > val2) {
			return 1;
		} else {
			return 0;
		}
	}
};
ScoreColumn.prototype = {
	init: function() {
		// todo
		this.size = 0;
	},

	save: function(name, score) {
		name = name.trim();
		score = score.trim();
		var from = Blockchain.transaction.from.toString().trim();
		var scoreItem = this.repo.get(from);
		if(scoreItem) {
			if(scoreItem.score > score) {
				return;
			} else {
				scoreItem = new ScoreItem();
				scoreItem.score = score;
				scoreItem.name = name;
				scoreItem.author = from;
				var index = this.size;
				this.arrayMap.put(index, from);
				this.repo.put(from, scoreItem);
				return this.size;
			}
		}
		scoreItem = new ScoreItem();
		scoreItem.score = score;
		scoreItem.name = name;
		scoreItem.author = from;
		var index = this.size;
		this.arrayMap.put(index, from);
		this.repo.put(from, scoreItem);
		this.size += 1;
		return this.size;
	},

	get: function(key) {
		key = key.trim();
		if(key === "") {
			throw new Error("empty key")
		}
		return this.repo.get(key);
	},

	len: function() {
		return this.size;
	},
	getTop: function(value) {
		var result = [];
		for(var i = 0; i < this.size; i++) {
			result.push(this.repo.get(this.arrayMap.get(i)).toString());
		}
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