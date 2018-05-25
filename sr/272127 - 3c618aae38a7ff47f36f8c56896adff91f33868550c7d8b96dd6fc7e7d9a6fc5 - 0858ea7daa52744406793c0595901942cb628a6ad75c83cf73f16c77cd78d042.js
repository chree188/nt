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

var CalNumbers = function () {
    LocalContractStorage.defineProperty(this, "size");
    LocalContractStorage.defineMapProperty(this, "wallRepo", {
        parse: function (text) {
            return new NumerItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    //LocalContractStorage.defineMapProperty(this, "userRepo");
};

CalNumbers.prototype = {
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

        //var userWordIds = this.userRepo.get(author) || [];
        //userWordIds[userWordIds.length] = id;
        //this.userRepo.set(author, userWordIds);

        this.size = this.size + 1;
    },

    list: function () {
        var result = [];
        for(var i = 0; i < this.size; i++){
            result[i] = this.wallRepo.get(i);
			console.log("-------result[i]------"+result[i]);
        }
        return result;
    },
	
	del: function (words, timestamp) {
        //var result = [];
        for(var i = 0; i < this.size; i++){
			
			console.log("----del---i------"+i);
			console.log("----del---this.size-----"+this.size);
			console.log("----del---this.wallRepo.get(i)----"+this.wallRepo.get(i));
            
            timestamp = timestamp ? timestamp : 1525061656367;

            var id = this.size
            var author = Blockchain.transaction.from;

            var wordItem = new NumerItem();
            wordItem.id = i;
            wordItem.words = words;
            wordItem.author = author;
            wordItem.timestamp = timestamp;
			
			console.log("----del---author----"+author+ "timestamp :" + timestamp);

            this.wallRepo.put(i, wordItem);
        }
        //var userWordIds = this.userRepo.get(author) || [];
        //userWordIds[userWordIds.length] = id;
        //this.userRepo.set(author, userWordIds);

        this.size = 0;//this.size + 1;
        
    },

};
module.exports = CalNumbers;