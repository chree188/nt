"use strict";

var DuanZi = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.content = obj.content;
        this.author = obj.author;
        this.contact = obj.contact;
        this.timestamp = obj.timestamp;
    } else {
        this.content = "";
        this.author = "";
        this.contact = "";
        this.timestamp = "";
    }
};

DuanZi.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var DuanZiStorage = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new DuanZi(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

DuanZiStorage.prototype = {
    init: function () {

    },
    add: function (content, author, contact) {
        content = content.trim();
        author = author.trim();
        contact = contact.trim();
        if (content === "") {
            throw new Error("请输入段子内容");
        } else if (content.length > 140) {
            throw new Error("段子不超过140个字")
        } else if (author === "") {
            throw new Error("请输入你的名字");
        } else if (contact === "") {
            throw new Error("请输入联系方式");
        }

        var duanZi = this.repo.get(content);
        if (duanZi) {
            throw new Error("段子已经发布过了");
        }
        duanZi = new DuanZi();
        duanZi.content = content;
        duanZi.author = author;
        duanZi.contact = contact;
        duanZi.timestamp = Blockchain.block.timestamp;
        this.repo.put(content, duanZi);
    },
    search: function (content) {
        if (content === "") {
            throw new Error("请输入段子内容");
        }
        return this.repo.get(content);
    }
};
module.exports = DuanZiStorage;