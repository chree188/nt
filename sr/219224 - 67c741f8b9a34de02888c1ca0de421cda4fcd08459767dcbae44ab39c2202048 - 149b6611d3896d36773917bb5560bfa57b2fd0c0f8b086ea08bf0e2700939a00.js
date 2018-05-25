"use strict";
var ShoutOut = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.lover = obj.lover;
        this.score = obj.score;
        this.author = obj.author;
        this.confession = obj.confession;
        this.date = obj.date;
    } else {
        this.lover = "";
        this.author = "";
        this.score = "";
        this.confession = "";
        this.date = "";
    }
};
ShoutOut.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};
var ShoutOutContract = function() {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function(text) {
            return new ShoutOut(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineMapProperty(this, "dataMap");
    LocalContractStorage.defineProperty(this, "size");
    LocalContractStorage.defineProperty(this, "top10ShoutOuts");
};
ShoutOutContract.prototype = {
    init: function() {
        this.size = 0;
    },
    getTop10: function() {
        return this.top10ShoutOuts;
    },
    sort: function() {
        var size = this.size;
        var result = [];
        var max = 999999999;
        for (var i = 0; i < size; i++) {
            var temp = -1;
            var temp_map = this.dataMap.get(this.arrayMap.get(i));
            for (var k = 0; k < size; k++) {
                if (this.dataMap.get(this.arrayMap.get(k)).score >= max) {
                    continue;
                }
                if (this.dataMap.get(this.arrayMap.get(k)).score > temp) {
                    temp = this.dataMap.get(this.arrayMap.get(k)).score;
                    temp_map = this.dataMap.get(this.arrayMap.get(k));
                }
            }
            result[i] = temp_map;
            max = temp;
        }
        var top = 10;
        if (size < top) {
            top = size;
        }
        var top10 = result.slice(0, top);
        LocalContractStorage.set("top10ShoutOuts", top10);
        return top10;
    },
    save: function(lover, confession, date) {
        var score = 1;
        confession = confession.trim();
        lover = lover.trim();
        if (lover === "") {
            throw new Error("empty lover");
        }
        var from = Blockchain.transaction.from;
        var shoutOut = this.repo.get(lover);
        if (shoutOut) {
            throw new Error("lover has been occupied");
        }
        shoutOut = new ShoutOut();
        shoutOut.author = from;
        shoutOut.confession = confession;
        shoutOut.lover = lover;
        shoutOut.score = score;
        shoutOut.date = date;
        this.repo.put(lover, shoutOut);
        var index = this.size;
        this.arrayMap.set(index, lover);
        this.dataMap.set(lover, shoutOut);
        this.size += 1;
        this.sort();
        return shoutOut;
    },
    get: function(lover) {
        lover = lover.trim();
        if (lover === "") {
            throw new Error("empty lover")
        }
        return this.repo.get(lover);
    },
    like: function(lover) {
        if (lover) {
            var shoutOut = this.get(lover);
            var score = shoutOut.score;
            score += 1;
            shoutOut.score = score;
            this.dataMap.set(lover, shoutOut);
            this.repo.set(lover, shoutOut);
            this.sort();
            return shoutOut;
        } else {
            throw new Error("input moive name is not valid");
        }
    },
    notlike: function(lover) {
        if (lover) {
            var shoutOut = this.get(lover);
            var score = shoutOut.score;
            score -= 1;
            if (score < 0) {
                score = 0;
            }
            shoutOut.score = score;
            this.dataMap.set(lover, shoutOut);
            this.repo.put(lover, shoutOut);
            this.sort();
            return shoutOut;
        } else {
            throw new Error("input moive name is not valid");
        }
    },
    len: function() {
        return this.size;
    },
    forEach: function(limit, offset) {
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
        var j = 0;
        for (var i = offset; i < number; i++) {
            var key = this.arrayMap.get(i);
            var object = this.dataMap.get(key);
            result[j] = '{"lover":"' + object.lover + '","confession":"' + object.confession + '","score:"' + object.score + '","author:"' + object.author + '","date":"' + object.date + '"}';
            j++;
        }
        return result;
    }
};
module.exports = ShoutOutContract;