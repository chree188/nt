"use strict";

var Book = function(text) {
    if (text) {
        var o = JSON.parse(text);
        this.id = o.id;
        this.name = o.name;
        this.autor = o.autor;
        this.cover = o.cover;
        this.recommender = o.recommender;
        this.reason = o.reason;
        this.upvote = o.upvote;
    } else {
        this.id = '';
        this.name = '';
        this.autor = '';
        this.cover = '';
        this.recommender = '';
        this.reason = '';
        this.upvote = 0;
    }
};

Book.prototype.toString = function () {
    return JSON.stringify(this);
};

function BookStore() {

    LocalContractStorage.defineMapProperty(this, "books", {
        parse: function (text) {
            return new Book(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineMapProperty(this, "upvotes");

    LocalContractStorage.defineProperties(this, {
        size: 0
    });

}

BookStore.prototype.init = function () {
    this.size = 0;
};

BookStore.prototype.recommend = function (name , autor, cover, reason) {
    var index = this.size;

    var book = new Book();
    book.name = name;
    book.autor = autor;
    book.cover = cover;
    book.reason = reason;
    book.id = index;
    book.recommender = Blockchain.transaction.from;

    this.books.put(book.id, book);
    this.size = this.size + 1;
    return book;
};

BookStore.prototype.get_books = function () {
    var size = this.size;
    var list = [];
    for(var i=0;i<size;i++){
        var book = this.books.get(i);
        list.push( book );
    }
    return list;
};


BookStore.prototype.like = function (id) {
    var book = this.books.get(id);
    if(!book){
        throw new Error('该书不存在');
    }

    var from = Blockchain.transaction.from;

    // 投过票的记录 book id 和 from 防止重复投票
    var upvote_key = from + '+' + id;

    if( this.upvotes.get(upvote_key) ){
        throw new Error('该书已经被你点赞过');
    }

    book.upvote += 1;

    this.books.put(book.id, book);

    this.upvotes.put(upvote_key, true);

    return book;
};

module.exports = BookStore;
