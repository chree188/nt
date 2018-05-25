"use strict";

var WordItem = function(text) {
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

WordItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var WordWallContract = function () {
    LocalContractStorage.defineProperty(this, "size");
    LocalContractStorage.defineMapProperty(this, "wallRepo", {
        parse: function (text) {
            return new WordItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "userRepo");
};

WordWallContract.prototype = {
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

        var wordItem = new WordItem();
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

    len: function(){
        return this.size;
    },

    iterate: function(limit, offset){
        limit = parseInt(limit);
        offset = parseInt(offset);
        if(offset > this.size){
           throw new Error("offset is not valid");
        }
        var number = offset + limit;
        if(number > this.size){
          number = this.size;
        }

        var result  = [];
        for(var i = offset, index = 0; i < number; i++){
            result[index++] = this.wallRepo.get(i);
        }
        return result;
    },

    getRandomWords: function(ids){
      var result = [];
      var index = 0;
      for(var i=0; i<ids.length; i++){
          var word = this.wallRepo.get(ids[i]);
          if(word && word != ""){
            result[index++] = this.wallRepo.get(ids[i]);
          }
      }
      return result;
    },

    list: function () {
        var result = [];
        for(var i = 0; i < this.size; i++){
            result[i] = this.wallRepo.get(i);
        }
        return result;
    },

    findMyWords: function(addr){
      var ids = this.userRepo.get(addr) || [];

      var result = [];
      for(var i = 0; i < ids.length; i++){
        result[i] = this.wallRepo.get(ids[i]);
      }
      return result;
    }
};
module.exports = WordWallContract;
