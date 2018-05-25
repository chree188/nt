"use strict";

//游戏信息
var HitInfo = function(str) {
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

HitInfo.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};


var Hit = function() {

    LocalContractStorage.defineMapProperty(this, "gset", {
        parse: function(text) {
            return new HitInfo(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });
}

Hit.prototype = {
    init: function() {
        // todo
    },
    start: function(key) {
        if (key == 'start') {
            return ture
        } 
    },
};

module.exports = Hit;