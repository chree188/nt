"use strict";

var QCodeItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.key = obj.key;
        this.value = obj.value;
    } else {
        this.key = "";
        this.value = "";
    }
};

QCodeItem.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var QCodeRecorder = function() {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function(text) {
            return new QCodeItem(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });
};

QCodeRecorder.prototype = {
    init: function() {
        // todo
    },

    save: function(key, value) {
        key = key.trim();
        if (key === "") {
            throw new Error("empty key");
        }
        if (key.length > 64) {
            throw new Error("key exceed limit length")
        }


        var qcodeItem = this.repo.get(key);
        if (qcodeItem) {
            throw new Error("qcode id has been occupied");
        }
        qcodeItem = new QCodeItem();
        qcodeItem.key = key;
        qcodeItem.value = value;
        this.repo.put(key, qcodeItem);
    },

    get: function(key) {
        key = key.trim();
        if (key === "") {
            throw new Error("empty key")
        }
        return this.repo.get(key);
    }
};
module.exports = QCodeRecorder;