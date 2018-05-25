"use strict";

var articleDict = function (text) {
    if (text) {
        var info = JSON.parse(text);
        this.name = info.name;
        this.link = info.link;
    } else {
        this.name = "";
        this.link = "";
    }
};

articleDict.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var TopList = function () {
    LocalContractStorage.defineProperty(this, "size");
    LocalContractStorage.defineMapProperty(this, "indexies");
    LocalContractStorage.defineMapProperty(this, "articlies", {
        parse: function (text) {
            return new articleDict(text);
        },
        stringify: function (obj) {
            return obj.toString();
        }
    })
};


TopList.prototype = {
    init: function () {
        this.size = 0;
    },

    getlist: function (limit, offset) {
        var limit = parseInt(limit);
        var offset = parseInt(offset);
        if (offset > this.size) {
            throw new Error("offset is not valid");
        }
        var number = offset + limit;
        if (number > this.size) {
            number = this.size;
        }
        var result = []
        for (var i = offset; i < number; i++) {
            var key = this.indexies.get(i);
            var article = this.articlies.get(key);
            result.push(article);
        }
        return result;
    },

    setArticle: function (name, link) {
        var article = new articleDict();
        article.name = name;
        article.link = link;
        var index = this.size;
        var d = new Date()
        var key = d.getTime();
        this.indexies.put(index, key);
        this.articlies.put(key, article);
        this.size += 1;
    },

    len: function () {
        return this.size;
    }

};

module.exports = TopList;