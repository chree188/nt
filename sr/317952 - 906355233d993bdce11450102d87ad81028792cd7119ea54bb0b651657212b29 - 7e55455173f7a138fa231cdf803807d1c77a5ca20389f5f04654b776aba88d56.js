"use strict";


var Fire = function(text) {
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


Fire.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var Fireworks = function () {
    LocalContractStorage.defineProperty(this, "size", null);
    LocalContractStorage.defineMapProperty(this, "firestyle", {
        parse: function (text) {
            return new Fire(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

Fireworks.prototype = {
    init: function () {
        // todo
        this.size = 1;
    },


    set: function (x, y) {
        var index = this.size;
        var from = Blockchain.transaction.from;

        var fire = this.firestyle.get(index);
        if (fire){
            throw new Error("value has been occupied");
        }
        
        fire = new Fire();
        fire.author = from;
        fire.key = index;
        fire.x = x;
        fire.y = y;
        this.firestyle.set(index, fire);
        this.size++;
        return index;
    },

    get: function(key) {
        return this.firestyle.get(parseInt(key));
    },

    getsize: function() {
        return this.size;
    },

};

module.exports = Fireworks;