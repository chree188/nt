"use strict";

var Struct = function (text) {
    if (text) {
        var obj = JSON.parse(text);

        this.id = obj.id;
        this.md5 = obj.md5;
        this.title = obj.title;
        this.message = obj.message;
        this.timestamp = obj.timestamp;
        this.author = obj.author;
    } else {
        this.id = "";
        this.md5 = "";
        this.title = "";
        this.message = ""
        this.timestamp = "";
        this.author = "";
    }
};

Struct.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var CopyrightContract = function () {
    LocalContractStorage.defineMapProperty(this, "db", {
        parse: function (text) {
            return new Struct(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

CopyrightContract.prototype = {
    init: function () {
        // todo
    },
    save: function (id, title, md5, message) {

        id = id.trim();
        title = title.trim();
        md5 = md5.trim();

        if (message !== "") {
            message = message.trim();
            if (message.length > 128) {
                throw new Error("message's length is too large");
            }
        }

        const timestamp = Date.now();

        if (id === "" || title === "" || md5 === "") {
            throw new Error("whoooooops, something is empty");
        }
        if (title.length > 64 || md5.length > 32 || id.length > 35) {
            throw new Error("title length is too long or  md5 /id length is too large")
        }


        var from = Blockchain.transaction.from;

        var article = this.db.get(id);
        if (article) {
            throw new Error("this article id has been occupied");
        }

        article = new Struct();

        article.id = id;
        article.author = from;
        article.title = title;
        article.message = message
        article.md5 = md5;
        article.timestamp = timestamp;

        this.db.put(id, article);
    },

    get: function (id) {
        id = id.trim();
        if (id === "") {
            throw new Error("id is empty")
        }
        return this.db.get(id);
    }
};
module.exports = CopyrightContract;