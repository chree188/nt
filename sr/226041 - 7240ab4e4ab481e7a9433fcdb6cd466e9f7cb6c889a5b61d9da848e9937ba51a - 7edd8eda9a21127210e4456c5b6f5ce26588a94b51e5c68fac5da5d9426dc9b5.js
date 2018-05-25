"use strict";

var Card = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.person = obj.person;
        this.content = obj.content;
        this.sender = obj.sender;
        this.timestamp = obj.timestamp;
        this.type = obj.type;
    } else {
        this.person = "";
        this.content = "";
        this.sender = "";
        this.timestamp = "";
        this.type = "";
    }
};

Card.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var CardTool = function() {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function(text) {
            return new Card(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "arrayMap");
};

CardTool.prototype = {
    init: function() {},

    add: function(sender, person, content, type) {
        var timestamp = Blockchain.transaction.timestamp;
        var from = Blockchain.transaction.from;

        var cur = this.arrayMap.get(from);
        if (cur) {
            this.arrayMap.put(from, cur+1);
        } else {
            this.arrayMap.put(from, 1);
            cur = 0;
        }

        var card = new Card();
        card.person = person;
        card.content = content;
        card.sender = sender;
        card.timestamp = timestamp;
        card.type = type;

        var key = from + ":" + cur;

        this.repo.put(key, card);
    },

    len: function() {
        var from = Blockchain.transaction.from;
        var cur = this.arrayMap.get(from);
        if (cur) {
            return { "len": cur, "from": from };
        } else {
            return { "len": 0, "from": from };
        }
    },

    get: function(key) {
        key = key.trim();
        if (key === "") {
            throw new Error("empty key")
        }
        return this.repo.get(key);
    }
};
module.exports = CardTool;