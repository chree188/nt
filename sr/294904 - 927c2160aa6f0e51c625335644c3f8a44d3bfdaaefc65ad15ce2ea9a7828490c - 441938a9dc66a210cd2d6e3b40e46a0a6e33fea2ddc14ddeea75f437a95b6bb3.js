"use strict";

//游戏信息
var ToolInfo = function(str) {
    if (str) {
        var obj = JSON.parse(str);
        this.address = obj.address;
        this.timestamp = obj.timestamp;
        this.url = obj.url;
    } else {
        this.address = '';
        this.timestamp = '';
        this.url = '';
    }

}

ToolInfo.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};


var Tools = function() {

    LocalContractStorage.defineMapProperty(this, "gset", {
        parse: function(text) {
            return new ToolInfo(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });
}

Tools.prototype = {
    init: function() {
        // todo
    },
    go: function(key,value) {
        key = key.toString().trim();
        if (key === "" || value === "") {
            throw new Error("empty key / value");
        }
        if (value.length > 2500 || key.length > 2500) {
            throw new Error("key / value exceed limit length")
        }
        if (typeof value !== 'object') {
            value = JSON.parse(value);
        }

        var from = Blockchain.transaction.from;
        var Tool = new ToolInfo();
        Tool.address = from;
        Tool.timestamp = value.timestamp;
        Tool.url = value.url;
        this.gset.put(key, Tool);
        return Tool;
    },
};

module.exports = Tools;