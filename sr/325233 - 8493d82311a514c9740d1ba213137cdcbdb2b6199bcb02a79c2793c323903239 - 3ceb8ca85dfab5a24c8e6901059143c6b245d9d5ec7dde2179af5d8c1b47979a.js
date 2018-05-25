"use strict";


var Star = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.key = obj.key;
        this.author = obj.author;
        this.x = obj.x;
        this.y = obj.y;
    } else {
        this.key = "";
        this.author = "";
        this.x = "";
        this.y = "";
    }
};


Star.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var Stars = function () {
    LocalContractStorage.defineProperty(this, "size", null);
    LocalContractStorage.defineMapProperty(this, "sky", {
        parse: function (text) {
            return new Star(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

Stars.prototype = {
    init: function () {
        // todo
        this.size = 1;
    },


    set: function (x, y) {
        var index = this.size;
        var from = Blockchain.transaction.from;

        var star = this.sky.get(index);
        if (star){
            throw new Error("value has been occupied");
        }
        
        star = new Star();
        star.author = from;
        star.key = index;
        star.x = x;
        star.y = y;
        this.sky.set(index, star);
        this.size++;
    },

    foreach: function() {
        var res = "";
        for (var i=1;i<this.size;i++){
            var res_key = i.toString();
            var res_value = this.sky.get(i);
            if(res === ""){
                res += res_value
            } else {
                res += "-"+res_value;
            }

        }
        return res;
    },

};

module.exports = Stars;