"use strict";

var DictItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.postTitle = obj.postTitle;
		this.postDate = obj.postDate;
        this.postID = obj.postID;
		this.author = obj.author;
	} else {
	    this.postTitle = "";
	    this.postDate = "";
        this.postID = "";
        this.author = "";
	}
};

DictItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var SuperDictionary = function () {

    LocalContractStorage.defineProperty(this, "size");

    LocalContractStorage.defineMapProperty(this, "arrayMap", {
        parse: function (text) {
            return new DictItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

SuperDictionary.prototype = {
    init: function () {
        this.size = 1;
    },

    len:function(){
      return this.size;
    },

    save: function (postTitle, postDate) {

        postTitle = postTitle.trim();
        postDate = postDate.trim();
        if (postTitle === "" || postDate === ""){
            throw new Error("empty postTitle / postDate");
        }
        if (postDate.length > 64 || postTitle.length > 64){
            throw new Error("postTitle / postDate exceed limit length")
        }

        var from = Blockchain.transaction.from;

        var index = this.size;

        var dictItem = new DictItem();
        dictItem.author = from;
        dictItem.postTitle = postTitle;
        dictItem.postDate = postDate;
        dictItem.postID = index;
        
        this.arrayMap.put(index, dictItem);
        this.size +=1;

    },

    get: function (postID) {

        if ( postID <= 0 ) {
            throw new Error("postID [1..]")
        }
        return this.arrayMap.get(postID);
    },

    getList: function(offset, limit) {
        offset = parseInt(offset);
        limit = parseInt(limit);
        if(offset>this.size){
           throw new Error("offset is not valid");
        }
        var number = offset+limit;
        if(number > this.size){
          number = this.size;
        }
        var result = new Array();
        for(var i=offset;i<number;i++){
            var text = this.arrayMap.get(i);
            result.push(text);
        }
        return result;
    }
};
module.exports = SuperDictionary;