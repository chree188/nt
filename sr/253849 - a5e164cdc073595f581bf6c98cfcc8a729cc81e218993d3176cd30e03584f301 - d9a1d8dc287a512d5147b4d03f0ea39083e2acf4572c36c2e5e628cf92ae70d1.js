"use strict";

//游戏信息
var DaziInfo = function(str) {
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

DaziInfo.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};


var Dazi = function() {

    LocalContractStorage.defineMapProperty(this, "gset", {
        parse: function(text) {
            return new DaziInfo(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });
}

Dazi.prototype = {
    init: function() {
        // todo
    },
    start: function(key) {
        if (key == 'start') {
            return 'ture'
        } 
    },
};

module.exports = Dazi;
