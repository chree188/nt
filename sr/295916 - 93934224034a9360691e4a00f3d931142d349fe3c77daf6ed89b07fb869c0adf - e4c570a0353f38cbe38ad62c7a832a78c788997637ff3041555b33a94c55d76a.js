'use strict';

var ForeverBookContract = function() {
    LocalContractStorage.defineProperty(this, "photosCount", null)
    LocalContractStorage.defineMapProperty(this, "book")
    LocalContractStorage.defineMapProperty(this, "bookCount")
    LocalContractStorage.defineMapProperty(this, "photos")
}

ForeverBookContract.prototype = {
    init: function() {
        this.photosCount = 0
    },

    createBook: function(name) {
        if (!name || name.trim() === "") name = "Book without name";

        var from = Blockchain.transaction.from;

        if (this._validBook(from)) {
            throw new Error("You already have a book");
        }

        this.book.set(from, {
            name: name.toString()
        })

        this.bookCount.set(from, [])

        return true;
    },

    getBook: function(from) {
        var photos = []

        if (!this._validBook(from)) {
            throw new Error("We haven't the book");
        }

        var book = this.book.get(from);

        var bookCount = this.bookCount.get(from);
        for (var i = 0; i < bookCount.length; i++) {
            photos.push(this.photos.get(bookCount[i]))
        }

        return {
            name: book.name,
            photos: photos
        }
    },

    savePhoto: function(photo, description) {
        if (!photo || photo.trim() === "") {
            throw new Error("Photo required");
        }

        var from = Blockchain.transaction.from;

        if (!this._validBook(from)) {
            throw new Error("We haven't the book");
        }

        var base64regex = /^data:image\/[0-9a-zA-Z]+;base64,([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

        if (!base64regex.test(photo)) {
            throw new Error("The photo must be in Base64");
        }

        this.photos.set(this.photosCount, {
            image: photo.toString(),
            description: description.toString(),
            hash: Blockchain.transaction.hash,
            time: Blockchain.transaction.timestamp
        });

        var bookCount = this.bookCount.get(from)
        bookCount.push(this.photosCount)
        this.bookCount.set(from, bookCount)

        var photosCount = new BigNumber(this.photosCount).plus(1)
        this.photosCount = photosCount

        return from
    },

    _validBook: function(from) {
        return this.book.get(from)
    }
}

module.exports = ForeverBookContract