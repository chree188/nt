'use strict';
var Letter = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.boy = obj.boy;
        this.girl = obj.girl;
        this.startAt = obj.startAt;
        this.content = obj.content;
        this.hash = obj.hash;
        this.author = obj.author;
    }
};

Letter.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var LoveWall = function () {
  LocalContractStorage.defineMapProperty(this, "data", {
    parse: function (text) {
      return new Letter(text);
    },
    stringify: function (o) {
      return o.toString();
    }
  });
};

LoveWall.prototype = {
    init: function() {
      //TODO:
    },

    save: function(boy, girl, startAt, content) {
        if (!boy || !girl || !startAt || !content) {
            throw new Error("empty boy, girl, startAt or content");
        }

        if (boy.length > 10 || girl.length > 10 || content.length > 100) {
            throw new Error("boy, girl or content too long")
        }
        var from = Blockchain.transaction.from;
        var hash = Blockchain.transaction.hash;

        var title = `BOY: ${boy}, GIRL: ${girl}, STARTAT: ${startAt}`;
        var letter = this.data.get(title);

        if (letter) {
            throw new Error("letter has been occupied");
        }
        letter = new Letter();
        letter.boy = boy;
        letter.girl = girl;
        letter.startAt = startAt;
        letter.content = content;
        letter.author = from;
        letter.hash = hash;
        this.data.put(hash, letter);
    },

    // get: function(boy, girl, startAt) {
    //     if (!boy || !girl || !startAt) {
    //         throw new Error("empty boy, girl or startAt");
    //     }
    //     var title = `BOY: ${boy}, GIRL: ${girl}, STARTAT: ${startAt}`;
    //     return this.data.get(title);
    // }，

    get: function(hash) {
        if (!hash) {
            throw new Error("hash can't empty")
        }
        return this.data.get(hash);
    }
};

module.exports = LoveWall;