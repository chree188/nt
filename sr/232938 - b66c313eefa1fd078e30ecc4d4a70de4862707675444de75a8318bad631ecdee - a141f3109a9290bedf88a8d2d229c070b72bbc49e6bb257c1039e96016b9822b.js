"use strict";

var BookItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.no = obj.no;
		this.book_name = obj.book_name;
		this.borrower = obj.borrower;
	} else {
	    this.no = "";
        this.book_name = "";
        this.borrower = "";
	}
};

BookItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var BookLending = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new BookItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

BookLending.prototype = {
    init: function () {
        // todo
    },

    save: function (no, book_name) {

        no = no.trim();
        book_name = book_name.trim();
        if (no === "" || book_name === ""){
            throw new Error("book information error");
        }
        if (no.length > 64 || book_name.length > 64){
            throw new Error("book information exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var bookItem = this.repo.get(no);
        if (bookItem){
            throw new Error("book has been borrowed");
        }

        bookItem = new BookItem();
        bookItem.borrower = from;
        bookItem.no = no;
        bookItem.book_name = book_name;

        this.repo.put(no, bookItem);
    },

    get: function (no) {
        no = no.trim();
        if ( no === "" ) {
            throw new Error("empty no")
        }
        return this.repo.get(no);
    }
};
module.exports = BookLending;