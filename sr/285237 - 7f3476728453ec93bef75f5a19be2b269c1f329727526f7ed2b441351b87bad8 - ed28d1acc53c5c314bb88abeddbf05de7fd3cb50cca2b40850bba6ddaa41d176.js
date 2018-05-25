"use strict";

var WriteItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.nick = obj.nick;
        this.content = obj.content;
        this.createTime = obj.createTime;
    } else {
        this.nick = "";
        this.content = "";
        this.createTime = 0;
    }
};

WriteItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var GreatWriter = function () {
    LocalContractStorage.defineMapProperty(this, "writerRepo", {
        parse: function (text) {
            return new WriteItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineProperty(this, "curWriteItemIndex");

};

GreatWriter.prototype = {
    init: function () {
        this.curWriteItemIndex = 0;
    },

    releaseWrite: function (nick, content) {
        nick = nick.trim();
        content = content.trim();

        var writeItem = new WriteItem();
        writeItem.nick = nick;
        writeItem.content = content;
        writeItem.createTime = new Date().getTime();

        this.writerRepo.put(this.curWriteItemIndex, writeItem);
        this.curWriteItemIndex += 1;
        return this.curWriteItemIndex;
    },

    getLiterature: function (limit, offset) {
        var limit = parseInt(limit);
        var offset = parseInt(offset);
        if (isNaN(limit) || isNaN(offset)) {
            throw new Error('limit and offset must be number');
        }
        var list = [];
        for (var i = offset; i < Math.min(limit + offset, this.curWriteItemIndex); i++) {
            list.push(this.writerRepo.get(i));
        }
        return list;
    }
};

module.exports = GreatWriter;
