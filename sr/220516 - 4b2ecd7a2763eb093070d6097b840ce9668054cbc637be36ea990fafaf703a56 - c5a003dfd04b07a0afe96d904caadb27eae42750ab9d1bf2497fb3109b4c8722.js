"use strict";

var Artitle = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.title = obj.title;//文章标题
        this.url = obj.url;//文章链接
        this.ethvalue = obj.ethvalue;//文章打赏
    } else {
        this.title = "";
        this.url = "";
        this.ethvalue = new BigNumber(0);
    }
};

Artitle.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var ArtitleRanking = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new Artitle(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

ArtitleRanking.prototype = {
    init: function () {
        // todo
    },

    save: function (title, url) {
        console.log(title);
        title = title.trim();
        url = url.trim();
        if (title === "" || url === "") {
            throw new Error("empty title / url");
        }
        if (title.length > 30 || url.length > 64) {
            throw new Error("title / url exceed limit length")
        }

        var value = Blockchain.transaction.value;
        var key = title + '_' + url;
        var artitleItem = this.repo.get(key);
        //如果发现库中存在，则更新ethValue，然后重新放入map中
        if (artitleItem) {
            artitleItem.ethvalue = artitleItem.ethvalue.plus(value);
            this.repo[key] = artitleItem;
        } else {
            artitleItem = new Artitle();
            artitleItem.title = title;
            artitleItem.url = url;
            artitleItem.ethvalue = value;
        }
        this.repo.put(key, artitleItem);
        return this.repo;
    },

    get: function (title, url) {
        title = title.trim();
        url = url.trim();
        if (title === "" || url === "") {
            throw new Error("empty title / url");
        }
        var key = title + '_' + url;
        key = key.trim();
        return this.repo.get(key);
    },
    getAll: function () {
        var arr = [];
        if (this.repo) {
            this.repo.forEach(function (item) {
                arr.push(item);
            });
        }
        return arr;
    }
};
module.exports = ArtitleRanking;