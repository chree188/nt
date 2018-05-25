"use strict";

var BookItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
        this.key = obj.key;
		this.name = obj.name; 
        this.stars = obj.stars
		this.img = obj.img;
		this.downloadUrl = obj.downloadUrl;
        this.buyUrl = obj.buyUrl;
        this.author = obj.author;
	} else {
        this.key = "";
	    this.name = ""; 
        this.stars = "";
        this.img = "";
        this.downloadUrl = "";
        this.buyUrl = "";
        this.author = "";
	}
};

BookItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var BookContract = function () {
    LocalContractStorage.defineMapProperty(this, "book", {
        parse: function (text) {
            return new BookItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

BookContract.prototype = {
    init: function () {
        // todo
    },

    save: function (key, name, stars, img, downloadUrl, buyUrl) {
        key = key.trim();
        name = name.trim();
        stars = stars.trim();
        img = img.trim();
        downloadUrl = downloadUrl.trim();
        buyUrl = buyUrl.trim();
        if ( key === "" || name === "" || stars === "" || img === "" || downloadUrl === "" || buyUrl === ""){
            throw new Error("传入参数缺失");
        }
        

        var from = Blockchain.transaction.from;
        var bookItem = this.book.get(key);
        if (bookItem){
            throw new Error("该电子书书已经存在");
        }

        bookItem = new BookItem();
        bookItem.key = key;
        bookItem.author = from;
        bookItem.name = name;
        bookItem.stars = stars;
        bookItem.img = img;
        bookItem.downloadUrl = downloadUrl;
        bookItem.buyUrl = buyUrl;
        this.book.put(key, bookItem);
    },

    getAll: function(){

        var bookArr = [];
        for(let i = 0; i < 100; i++){
            var key = i+1;
            var book = this.book.get('book'+key);
            if(book){
                bookArr.push(book);
            }
        }
        
        return bookArr;
        
    },

    get: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("key 参数缺失！")
        }
        return this.book.get(key);
    },

    del: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("key 参数缺失！")
        }
        return this.book.del(key);
    }
};
module.exports = BookContract;