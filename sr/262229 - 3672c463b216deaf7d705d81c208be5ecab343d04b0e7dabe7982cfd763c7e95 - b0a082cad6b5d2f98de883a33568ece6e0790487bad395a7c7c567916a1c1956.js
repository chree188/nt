"use strict";

var DAppItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.name = obj.name;
        this.url = obj.url;
        this.author = obj.author;
        this.desc = obj.desc;
        this.submitter = obj.submitter;
    } else {
        this.name = "";
        this.author = "";
        this.url = "";
        this.desc = "";
        this.submitter = "";
    }
};

DAppItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var DAppBoard = function () {
    LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineMapProperty(this, "dataMap", {
        parse: function (text) {
            return new DAppItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineProperty(this, "size");
};

DAppBoard.prototype = {
    init: function () {
        this.size = 0;

        var dapp = new DAppItem();
        dapp.name = "DAppBoard";
        dapp.desc = "A palce to discover dapps. You can also submit your own dapp.";
        dapp.author = "gelitenight";

        this.add(dapp)
    },

    add: function (item) {
        var dapp = new DAppItem();
        dapp.name = item.name.trim();
        dapp.url = item.url.trim();
        dapp.desc = item.desc.trim();
        dapp.author = item.author.trim();

        var from = Blockchain.transaction.from;
        dapp.submitter = from;

        var index = this.size;
        this.arrayMap.set(index, dapp.name);
        this.dataMap.set(dapp.name, dapp);
        this.size += 1;
    },

    _get: function (key) {
        return this.dataMap.get(key);
    },

    len: function () {
        return this.size;
    },

    page: function (limit, offset) {
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (offset > this.size) {
            throw new Error("offset is not valid");
        }
        var number = offset + limit;
        if (number > this.size) {
            number = this.size;
        }
        var result = [];
        for (var i = offset; i < number; i++) {
            var key = this.arrayMap.get(i);
            var object = this.dataMap.get(key);
            result.push(object);
        }
        return result;
    }
};

module.exports = DAppBoard;