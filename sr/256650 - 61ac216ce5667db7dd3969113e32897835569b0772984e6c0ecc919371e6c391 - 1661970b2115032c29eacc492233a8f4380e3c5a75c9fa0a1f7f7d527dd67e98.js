"use strict";

var ScoreItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.score = obj.score;
		this.author = obj.author;
	} else {
	    this.score = "";
        this.author = "";
	}
};

ScoreItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var ScoreStore = function () {
    LocalContractStorage.defineMapProperty(this, "scoreInfo", {
        parse: function (text) {
            return new ScoreItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineMapProperty(this, "score", {
        parse: function (text) {
            return new ScoreItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineProperty(this, "size");
};

ScoreStore.prototype = {
    init: function () {
        this.size = 0;
    },

    saveScoreItem: function (score) {
        score = score.trim();

        var from = Blockchain.transaction.from;

        var scoreItem = new ScoreItem();
        
        scoreItem.score = score;

        scoreItem.author = from;

        this.scoreInfo.put(from, scoreItem);

        this.size +=1;
    },

    getScoreItem: function (author) {

        return this.scoreInfo.get(author);
    },

    getSize: function(){
        this.size;
    }
};
module.exports = ScoreStore;