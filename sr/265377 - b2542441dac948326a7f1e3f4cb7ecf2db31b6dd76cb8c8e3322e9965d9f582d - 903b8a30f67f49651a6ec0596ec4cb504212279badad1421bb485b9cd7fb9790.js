"use strict";
var PlayerLevel = function (text) {
    if(text)
    {
        var obj = JSON.parse(text);
        {
            this.level = ojb.level;
        }
    }
    else
    {
        this.level = "";
    }
};
PlayerLevel.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};
 
var PlayBoxItem = function(text) {
	if (text) {
	    var obj = JSON.parse(text);
	    this.playerid = obj.playerid;
	    this.level = obj.level;
	    this.step = obj.step;
	
	
	} else {
	    this.playerid = "";
	    this.level = "";
	    this.step = "";
	  
	}
};

PlayBoxItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var PushBox = function () {
    LocalContractStorage.defineMapProperty(this, "playermax", {
        parse: function (text) {
            return new PlayerLevel(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineMapProperty(this, "playeritem", {
        parse: function (text) {
            return new PlayBoxItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });


    LocalContractStorage.defineMapProperty(this, "supporters", {
        parse: function (text) {
            return new SupporterVoteItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineProperty(this, "size");
};

PushBox.prototype = {
    init: function () {
        this.size = 0;
    },

    saveplayerlevel: function (level, step) {
        var from = Blockchain.transaction.from;
        var pl = this.playeritem.get(from);
        if (pl) {
            pl = new PlayerLevel();
            pl.level = level;
            this.playeritem.set(from, pl);   
        }
        else {
            pl = new PlayerLevel();
            pl.level = level;
            this.playeritem.put(from, pl);
            var index = this.size;
            this.arrayMap.set(index, from);
            this.size += 1;
           
          
        }
    },

    getplayerlevel: function () {
        var from = Blockchain.transaction.from;
        var flag = "0";
        var playerlevel = this.playeritem.get(from);
        if (!playerlevel) {
            //throw new Error("vote info not found");
            playerlevel = "";
        }

        return {
            "method": "getplayerlevel",
            "playerlevel": playerlevel
        }
    },

    getallplayerlevel:function()
    {
        var allplayers = new Array();
        for (var i = 0; i < this.size; i++) {
            var key = this.arrayMap.get(i);
            var data = {};
            data["id"] = key;
            data["level"] = this.playeritem.get(key);
            allplayers.push(data);
        }
        return {
            "method": "getallplayerlevel",
            "getallplayerlevel": allplayers
        }
    },
};
module.exports = PushBox;