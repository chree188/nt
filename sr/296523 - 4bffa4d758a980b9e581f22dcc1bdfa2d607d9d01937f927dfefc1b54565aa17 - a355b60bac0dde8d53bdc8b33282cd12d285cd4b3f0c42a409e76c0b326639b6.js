"use strict";

var KeyWordItem = function(text) {
	if (text) {
		var item = JSON.parse(text);
		this.id = item.id;
		this.words = item.words;
		this.name = item.name;
		
	} else {
    this.id = "";
    this.words = "";
    this.name = "";
    
	}
};


KeyWordItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};


var KeyWordDefine = function () {
    LocalContractStorage.defineProperty(this, "size");
    LocalContractStorage.defineMapProperty(this, "keyWordMap", {
        parse: function (text) {
            return new KeyWordItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "NameMap");
};

KeyWordDefine.prototype = {
    init: function () {
      this.size = 0;
    },

    save: function (keyWords, name) {
        keyWords = keyWords.trim();
        if(keyWords === ""){
           throw new Error("empty keyWords");
        }
 
        var id = this.size;
        var author = Blockchain.transaction.from;//交易源地址

        var keyWordItem = new KeyWordItem();
        keyWordItem.id = id;
        keyWordItem.words = keyWords;
        keyWordItem.name = name;
        
        this.keyWordMap.put(id, keyWordItem);
		this.size = this.size + 1;
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
            result[index++] = this.keyWordMap.get(i);
        }
        return result;
    },

    getWords: function(){
      var result = [];      
      for(var i=0; i<this.size; i++){
           result[i] = this.keyWordMap.get(i);                 
      }
      return result;
    },

};
module.exports = KeyWordDefine;