"use strict";

//游戏信息
var JimuInfo = function(str) {
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

JimuInfo.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};


var Jimu = function() {

    LocalContractStorage.defineMapProperty(this, "gset", {
        parse: function(text) {
            return new JimuInfo(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });
}

Jimu.prototype = {
    init: function() {
        // todo
    },
    start: function(key) {
        if (key == 'start') {
            return 'ture'
        } 
    },
};

module.exports = Jimu;
