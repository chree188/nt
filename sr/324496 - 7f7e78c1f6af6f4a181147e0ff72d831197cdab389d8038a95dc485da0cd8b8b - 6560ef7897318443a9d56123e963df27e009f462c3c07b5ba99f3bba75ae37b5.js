"use strict";

var ToolItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.key = obj.key;
        this.name = obj.name;
        this.date = obj.date;
        this.phone = obj.phone;
        this.remark=obj.remark;
    } else {
        this.key = "";
        this.name = "";
        this.date = "";
        this.phone = "";
        this.remark="";
    }
};


ToolItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};
var Tool = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new ToolItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

Tool.prototype = {
    init: function () {
    },
    save: function (key, name, phone, date,remark) {
        //var from = Blockchain.transaction.from;
        var toolItem = this.repo.get(key);
        if (toolItem) {
            toolItem.key = JSON.parse(toolItem).key;
            toolItem.name = JSON.parse(toolItem).name + '|-' + name;
            toolItem.phone = JSON.parse(toolItem).phone + '|-' + phone;
            toolItem.date = JSON.parse(toolItem).date + '|-' + date;
            toolItem.remark = JSON.parse(toolItem).remark + '|-' + remark;
            this.repo.put(key, toolItem);

        } else {
            toolItem = new ToolItem();
            toolItem.key = key;
            toolItem.name = name;
            toolItem.phone = phone;
            toolItem.date = date;
            toolItem.remark=remark;
            this.repo.put(key, toolItem);
        }
    },
    get: function (key) {
        key = key.trim();
        if (key === "") {
            throw new Error("empty key")
        }
        return this.repo.get(key);
    }
};
module.exports = Tool;