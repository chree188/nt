"use strict";

var SellContent = function (text) {
	if (text) {
		var obj = JSON.parse(text);
		this.key =  obj.key;
		this.sales = obj.sales;
		this.content = obj.content;
	}else{
		this.key ;
		this.sales = 0;
		this.content = "";
	}
};

SellContent.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};


var BookShopContent = function () {
	LocalContractStorage.defineProperty(this, "size");
	LocalContractStorage.defineMapProperty(this, "arrayMap");
	LocalContractStorage.defineMapProperty(this,"bookshop",{
		parse: function(text){
			return new SellContent(text);
		},
		stringify: function(o){
			return o.toString();
		}
	});
   
};

BookShopContent.prototype = {
    init: function () {
        this.size = 0;
    },
    
    sell: function (key) {
		
		key = key.trim();

		if(key ===""){
			throw new Error("not select!!");
		}

		var book = this.bookshop.get(key);

        if (book){
			book.sales = book.sales + 1;
        }else{
			book = new SellContent();
			this.arrayMap.set(this.size, key);
			book.key = key;
			book.sales = 1;
			this.size = this.size + 1;
		}
        this.bookshop.put(key, book);
    },
	
	comment: function (key,content) {
		
		key = key.trim();
		content = content.trim();
		if(key ===""){
			throw new Error("not select!!");
		}
		var book = this.bookshop.get(key);

        if (book){
			book.content = book.content+ '|'+ content;
        }else{
			throw new Error("have no this book");
		}
        this.bookshop.put(key, book);
    },

	 getsales: function () {

		var message = [];
		
		for(var i=0; i< this.size; i++){
            var tmpkey = this.arrayMap.get(i);
			if(tmpkey){
				var object = this.bookshop.get(tmpkey);
				if(object){
					message.push(object.key + ':'+object.sales);
				}
			}
        }

		return message;
    },

    getcomment: function (key) {
		
		key = key.trim();
		
		if(key ===""){
			throw new Error("not select!!");
		}
		var book = this.bookshop.get(key);

        if (book){
			return book.content;
        }
		return "nothing";
    },

	
	
	
};

module.exports = BookShopContent;