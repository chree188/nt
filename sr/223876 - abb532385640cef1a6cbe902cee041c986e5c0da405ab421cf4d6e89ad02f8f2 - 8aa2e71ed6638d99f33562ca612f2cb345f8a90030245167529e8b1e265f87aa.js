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
    LocalContractStorage.defineMapProperty(this, "dataMap", {
        parse: function (text) {
            return new Artitle(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineProperty(this, "size");
};

ArtitleRanking.prototype = {
    init: function () {
        this.size = 0;
    },

    save: function (title, url) {
        var index = this.size;
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
        var artitleItem = this.dataMap.get(key);
        //如果发现库中存在，则更新ethValue，然后重新放入map中
        if (artitleItem) {
            artitleItem.ethvalue = new BigNumber(artitleItem.ethvalue).plus(value);
        } else {
            artitleItem = new Artitle();
            artitleItem.title = title;
            artitleItem.url = url;
            artitleItem.ethvalue = value;
            this.size += 1;
        }
        this.arrayMap.set(index, key);
        this.dataMap.set(key, artitleItem);
    },

    get: function (title, url) {
        title = title.trim();
        url = url.trim();
        if (title === "" || url === "") {
            throw new Error("empty title / url");
        }
        var key = title + '_' + url;
        key = key.trim();
        return this.dataMap.get(key);
    },
    len: function () {
        return this.size;
    },
    getAll: function () {
        var arr = [];
        if (this.size > 0) {
            for (var i = 0; i < this.size; i++) {
                var key = this.arrayMap.get(i);
                var object = this.dataMap.get(key);
                arr.push(object);
            }
            arr.sort(function (obj1, obj2) {
                if (obj1.ethvalue < obj2.ethvalue) {
                    return 1;
                } else if (obj1.ethvalue > obj2.ethvalue) {
                    return -1;
                } else {
                    return 0;
                }
            });
        }
        return arr;
    }
};
module.exports = ArtitleRanking;