"use strict";

var WordItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.word = obj.word;
		this.to = obj.to;
		this.author = obj.author;
	} else {
	    this.word = "";
	    this.author = "";
	    this.value = "";
	}
};

WordItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var LoveWord = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new WordItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

LoveWord.prototype = {
    init: function () {
        // todo
    },

    save: function (word, to) {

        word = word.trim();
        to = to.trim();
        if (word === "" || to === ""){
            throw new Error("empty word / to");
        }
        if (to.length > 64 || word.length > 64){
            throw new Error("word / to exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var wordItem = this.repo.get(word);
        if (wordItem){
            throw new Error("to has been occupied");
        }

        wordItem = new WordItem();
        wordItem.author = from;
        wordItem.word = word;
        wordItem.to = to;

        this.repo.put(word, wordItem);
    },

    get: function (word) {
        word = word.trim();
        if ( word === "" ) {
            throw new Error("empty word")
        }
        return this.repo.get(word);
    }
};
module.exports = LoveWord;