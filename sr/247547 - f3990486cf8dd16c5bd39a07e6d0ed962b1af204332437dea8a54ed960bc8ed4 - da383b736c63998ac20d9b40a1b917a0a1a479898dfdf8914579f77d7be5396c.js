"use strict";

var NumerItem = function(text) {
	if (text) {
		var item = JSON.parse(text);
		this.id = item.id;
		this.words = item.words;
		this.author = item.author;
    this.timestamp = item.timestamp;
	} else {
    this.id = "";
    this.words = "";
    this.author = "";
    this.timestamp = "";
	}
};

NumerItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var ChineseWord = function () {
    LocalContractStorage.defineProperty(this, "size");
    LocalContractStorage.defineMapProperty(this, "wallRepo", {
        parse: function (text) {
            return new NumerItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "userRepo");
};

ChineseWord.prototype = {
    init: function () {
      this.size = 0;
    },

    save: function (words, timestamp) {
        words = words.trim();
        if(words === ""){
           throw new Error("empty words");
        }
        timestamp = timestamp ? timestamp : 1525061656367;

        var id = this.size
        var author = Blockchain.transaction.from;

        var wordItem = new NumerItem();
        wordItem.id = id;
        wordItem.words = words;
        wordItem.author = author;
        wordItem.timestamp = timestamp;

        this.wallRepo.put(id, wordItem);

        var userWordIds = this.userRepo.get(author) || [];
        userWordIds[userWordIds.length] = id;
        this.userRepo.set(author, userWordIds);

        this.size = this.size + 1;
    },

    list: function () {
        var result = [];
        for(var i = 0; i < this.size; i++){
            result[i] = this.wallRepo.get(i);
        }
        return result;
    },
};
module.exports = ChineseWord;
