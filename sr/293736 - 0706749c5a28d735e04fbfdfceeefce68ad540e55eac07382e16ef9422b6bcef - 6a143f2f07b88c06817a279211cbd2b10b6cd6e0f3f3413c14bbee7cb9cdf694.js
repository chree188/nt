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

ScoreItem.prototype = {
	init: function() {
		// todo
	},

	save: function(name, score) {
		name = name.trim();
		score = score.trim();
		var from = Blockchain.transaction.from;
		var scoreItem = this.repo.get(from);
		if(scoreItem && scoreItem.score.parseInt() > score.parseInt()) {
			return;
		}
		scoreItem = new ScoreItem();
		scoreItem.score = score;
		scoreItem.name = name;
		scoreItem.author = from;
		this.repo.put(from, scoreItem);

	},

	get: function(value) {
		var from = Blockchain.transaction.from;
		return this.repo.get(from);
	},

	getTop: function(value) {
		return this.repo.sort(compare("score"));
	},
	skip: function(value) {
		var value = Blockchain.transaction.value;
		if(value.parseFloat() >= 0.001) return true;
		else return false;
	}
};
module.exports = ScoreItem;