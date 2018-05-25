"use strict";

var PoetryItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.title = obj.title;
        this.content = obj.content;
        this.author = obj.author;
    }
};

PoetryItem.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var SuperPoetry = function() {
    LocalContractStorage.defineMapProperty(this, "data", {
        parse: function(text) {
            return new PoetryItem(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });
};

SuperPoetry.prototype = {
    init: function() {
        // todo
    },

    save: function(title, content) {
        title = title.trim();
        content = content.trim();
        if (title === "" || content === "") {
            throw new Error("empty title / content");
        }
        if (title.length > 128 || content.length > 512) {
            throw new Error("title / content exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var poetryItem = this.data.get(title);
        if (poetryItem) {
            throw new Error("poetry has been occupied");
        }

        poetryItem = new PoetryItem();
        poetryItem.author = from;
        poetryItem.title = title;
        poetryItem.content = content;

        this.data.put(title, poetryItem);
    },

    get: function(title) {
        title = title.trim();
        if (title === "") {
            throw new Error("empty title")
        }
        return this.data.get(title);
    }
};
module.exports = SuperPoetry;