'use strict'

var WhisperItem = function(src) {
    if (src) {
        var obj = JSON.parse(src);
        this.target = obj["target"];
        this.content = obj["content"];
        this.count = obj["count"];
        this.author = obj["author"];
    }
    else{
        this.content = "";
        this.count = 0;
    }
};

WhisperItem.prototype = {
    toString : function() {
        return JSON.stringify(this);
    }
};

var Whisper = function() {
    LocalContractStorage.defineMapProperty(this, "data", {
        parse: function(src) {
            return new WhisperItem(src);
        },
        stringify: function(obj) {
            return obj.toString();
        }
    });
};

Whisper.prototype = {
    init: function() {},
    save: function(target, content) {
        if (!target || !content) {
            throw new Error("One or more arguments are empty");
        }
        if (target.length > 20 || content.length > 500) {
            throw new Error("Content is too long");
        }
        var from = Blockchain.transaction.from;
        var item = this.data.get(target);
        if (!item) {
            item = new WhisperItem();
        }
        item.target = target;
        item.count += 1;
        item.content += item.count+". "+content+"<br/>";
        item.author = from;
        
        this.data.put(target, item);
    },
    get: function(target) {
        if (!target) {
            throw new Error("Empty target");
        }
        return this.data.get(target);
    }
};

module.exports = Whisper;