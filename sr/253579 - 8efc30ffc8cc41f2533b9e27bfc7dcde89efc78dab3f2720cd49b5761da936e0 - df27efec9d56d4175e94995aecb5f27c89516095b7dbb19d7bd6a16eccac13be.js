"use strict";

//游戏信息
var FishInfo = function(str) {
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

FishInfo.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};


var Fish = function() {

    LocalContractStorage.defineMapProperty(this, "gset", {
        parse: function(text) {
            return new FishInfo(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });
}

Fish.prototype = {
    init: function() {
        // todo
    },
    start: function(key) {
        if (key == 'start') {
            return ture
        } 
    },
};

module.exports = Fish;
