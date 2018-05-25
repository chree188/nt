"use strict";

var FavoriteItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.keyword = obj.keyword;
		this.name = obj.name;
		this.description = obj.description;
		this.author = obj.author;
		this.time = obj.time;
	} else {
	    this.keyword = "";
		this.name = "";
		this.description = "";
		this.author = "";
		this.time = "";
	}
};

FavoriteItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var FavoriteContract = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new FavoriteItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineProperty(this, "size");
    LocalContractStorage.defineMapProperty(this, "arrayMap");
};

FavoriteContract.prototype = {
    init: function () {
        // todo
        this.size = 0;
    },
    
    len:function(){
      return this.size;
    },

    save: function (keyword,name,description,author) {

		var index = this.size;
        keyword = keyword.trim();
        name = name.trim();
        description = description.trim();
        author = author.trim();
        if (keyword === "" || name === ""|| description === ""|| author === ""){
            throw new Error("empty value");
        }
        if (keyword.length > 256|| name.length > 256|| description.length > 256|| author.length > 256){
            throw new Error("value exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var favoriteItem = this.repo.get(keyword);
        if (favoriteItem){
            throw new Error("name has been occupied");
        }
        var date = new Date();
        favoriteItem = new FavoriteItem();
        favoriteItem.keyword = keyword;
        favoriteItem.name = name;
        favoriteItem.description = description;
        favoriteItem.author = author;
        favoriteItem.time = date.toString();
        this.repo.put(keyword, favoriteItem);
        this.arrayMap.put(index, keyword);
        this.size +=1;
    },

    get: function (keyword) {
        keyword = keyword.trim();
        if ( keyword === "" ) {
            throw new Error("empty keyword")
        }
        return this.repo.get(keyword);
    },
    
    forEach: function(limit, offset,keyword){
        limit = parseInt(limit);
        offset = parseInt(offset);
        if(offset>this.size){
           throw new Error("offset is not valid");
        }
        var number = offset+limit;
        if(number > this.size){
          number = this.size;
        }
        var result  = new Array();
        result=[]; 
        for(var i=offset;i<number;i++){
            var key = this.arrayMap.get(i);
            if(key.indexOf(keyword)!=-1){
            	var object = this.repo.get(key);
            	result.push(object);
            }
        }
        return result;
    },
    
    getall: function(limit, offset){
        limit = parseInt(limit);
        offset = parseInt(offset);
        if(offset>this.size){
           throw new Error("offset is not valid");
        }
        var number = offset+limit;
        if(number > this.size){
          number = this.size;
        }
        var result  = new Array();
        result=[]; 
        for(var i=offset;i<number;i++){
            var key = this.arrayMap.get(i);
            var object = this.repo.get(key);
            result.push(object);
        }
        return result;
    }
    
};
module.exports = FavoriteContract;