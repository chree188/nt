"use strict";

//游戏信息
var BlockInfo = function(str) {
    if (str) {
        var obj = JSON.parse(str);
        this.address = obj.address;
        this.timestamp = obj.timestamp;
        this.score = obj.score;
        this.userrname = obj.userrname;
    } else {
        this.address = '';
        this.timestamp = '';
        this.score = '';
        this.userrname = '';
    }

}

BlockInfo.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};


var Block = function() {

    LocalContractStorage.defineMapProperty(this, "gset", {
        parse: function(text) {
            return new BlockInfo(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });
}

Block.prototype = {
    init: function() {
        // todo
    },

    put: function(key, value) {
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
        var Games = new BlockInfo();
        Games.address = from;
        Games.score = value.score;
        Games.timestamp = value.timestamp;
        Games.userrname = value.userrname;
        this.gset.put(key, Games);

        var highscore = this.gset.get('highscore');
        if (highscore) {
            if (parseInt(highscore.score) < parseInt(value.score)) {
                this.gset.put('highscore', Games);
            }
        } else {
            this.gset.put('highscore', Games);
        }
        return Games;
    },

    start: function(key) {
        if (key == 'start') {
            var highscore = this.gset.get('highscore');
            if (highscore) {
                return highscore;
            } else {
                return 0
            }
        } else {
            return 'false';
        }
    },

    del: function(key) {
    

      result = LocalContractStorage.delete(key);

      return result;
    }
};

module.exports = Block;