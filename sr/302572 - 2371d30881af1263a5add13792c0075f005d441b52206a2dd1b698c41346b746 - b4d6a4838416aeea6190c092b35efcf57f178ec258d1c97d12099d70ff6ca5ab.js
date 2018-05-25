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

var names = function(c){
	if(c){
		var info = JSON.parse(c);
		this.name = info.name;
	}else{
		this.name= [];
	}
};

names.prototype = {
    toString: function() {
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

    LocalContractStorage.defineMapProperty(this, "NameMap",{
		parse: function (text) {
			return new names(text);
		},
		stringify:function (o) {
			return o.toString();
		}
	});
};

KeyWordDefine.prototype ={
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
		var array = this.NameMap.get(name);
		if(!array){
			array = new names();
		}
		array.name.push(id);
		this.NameMap.put(name,array);
    },

	geta:function(name){
		var s = this.NameMap.get(name);
		return s;
	},

    getWords: function(){
      var result = [];      
      for(var i=0; i<this.size; i++){
           result[i] = this.keyWordMap.get(i);                 
      }
      return result;
    },
	
	getWordsByName: function(data){
		var result = []; 
        var idList = this.NameMap.get(data);
		if(idList){
			for(var i =0; i<idList.name.length; i++){
                    var id = idList.name[i];
					result[i] = this.keyWordMap.get(id);
		}
      return result;
	}
	}

};
module.exports = KeyWordDefine;