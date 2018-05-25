"use strict";

var NebSoundItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.key = obj.key;
        this.value = obj.value;
    } else {
        this.key = "";
        this.value = "";
    }
};

NebSoundItem.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var NebSoundRecorder = function() {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function(text) {
            return new NebSoundItem(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });
};

NebSoundRecorder.prototype = {
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


        var soundItem = this.repo.get(key);
        if (soundItem) {
            throw new Error("sound id has been occupied");
        }
        soundItem = new NebSoundItem();
        soundItem.key = key;
        soundItem.value = value;
        this.repo.put(key, soundItem);
    },

    get: function(key) {
        key = key.trim();
        if (key === "") {
            throw new Error("empty key")
        }
        return this.repo.get(key);
    }
};
module.exports = NebSoundRecorder;