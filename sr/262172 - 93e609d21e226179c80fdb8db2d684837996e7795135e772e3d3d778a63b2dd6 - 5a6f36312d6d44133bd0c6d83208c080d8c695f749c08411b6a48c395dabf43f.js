"use strict";

var LoveItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.name1 = obj.name1;
        this.id1 = obj.id1;
        this.name2 = obj.name2;
        this.id2 = obj.id2;
        this.content = obj.content;
        this.createTime = obj.createTime;
    } else {
        this.name1 = "";
        this.id1 = "";
        this.name2 = "";
        this.id2 = "";
        this.content = "";
        this.createTime = 0;
    }
};

LoveItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var ErrorItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.code = obj.code;
        this.message = obj.message;
    } else {
        this.code = "";
        this.message = "";
    }
};

ErrorItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var LoveRegistration = function () {
    LocalContractStorage.defineMapProperty(this, "loveRepo", {
        parse: function (text) {
            return new LoveItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    // LocalContractStorage.defineMapProperty(this, "historyRepo", {
    //     parse: function (text) {
    //         return text;
    //     },
    //     stringify: function (o) {
    //         return o.toString();
    //     }
    // });
};

LoveRegistration.prototype = {
    init: function () {
        // this.curLoveItemIndex = 0;
    },

    register: function (name1, id1, name2, id2, content) {
        id1 = id1.trim();
        name1 = name1.trim();
        name2 = name2.trim();
        id2 = id2.trim();
        content = content.trim();
        if (id1) {
            new Error('Id cannot be empty');
        }
        if (id2) {
            new Error('Id cannot be empty');
        }
        // var from = Blockchain.transaction.from;

        if (this.loveRepo.get(id1)) {
            return new Error('The id is registered in advance');
        }
        if (this.loveRepo.get(id2)) {
            return new Error('The id is registered in advance');
        }

        var loveItem = new LoveItem();
        loveItem.id1 = id1;
        loveItem.name1 = name1;
        loveItem.id2 = id2;
        loveItem.name2 = name2;
        loveItem.content = content;
        loveItem.createTime = new Date().getTime();

        this.loveRepo.put(id1, loveItem);
        this.loveRepo.put(id2, loveItem);

        // this.historyRepo.push(this.curLoveItemIndex, id);
        // this.curLoveItemIndex += 1;
    },

    check: function (id) {
        id = id.trim();
        var loveItem = this.loveRepo.get(id);
        if (!loveItem) {
            var errorItem = new ErrorItem();
            errorItem.code = "1";
            errorItem.message = "The id not be register";
            return errorItem;
        }
        return this.loveRepo.get(id);
    }
};

module.exports = LoveRegistration;
