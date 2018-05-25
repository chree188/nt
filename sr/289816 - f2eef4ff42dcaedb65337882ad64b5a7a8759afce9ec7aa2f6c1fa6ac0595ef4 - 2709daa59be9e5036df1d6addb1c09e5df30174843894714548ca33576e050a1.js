"use strict";

var BarrageItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.key = obj.key;
		this.value= obj.value;
		this.author = obj.author;
	} else {
	    this.key = ""; //省份
	    this.value = "";
	    this.author = "";
	}
};

BarrageItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var Barrage = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new BarrageItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

Barrage.prototype = {
    init: function () {
        // todo
    },

    save: function (key, value) {

        key = key.trim();
        value = value.trim();
        if (key === "" || value === ""){
            throw new Error("empty key / value");
        }
        if (value.length > 64 || key.length > 64){
            throw new Error("key / value exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var barrageItem = this.repo.get(key);
        if (barrageItem){
            throw new Error("key has been occupied");
        }

        barrageItem = new BarrageItem();
        barrageItem.author = from;
        barrageItem.key = key;
        barrageItem.value = value;

        this.repo.put(key, barrageItem);
    },

    get: function (key) {
        if ( key === "" ) {
            throw new Error("empty key")
        }
        return this.repo.get(key);
    },
    
    getAll:function(todayDate)
    {
		var objectList = new Array();
    	for (var i=0;i<50;i++)
		{
			var barrageItem = this.repo.get(todayDate+""+i);
			if (barrageItem){
            	objectList.push(barrageItem);
        	}else
        	{
        		break;
        	}
			
		}
		return objectList;
   },
   
   getMaxNum:function(todaydate)
   {
    	var maxValue;
    	for (var i=0;i<50;i++)
		{
			var barrageItem = this.repo.get(todaydate+""+i);
			if (!barrageItem){
				maxValue = i;
            	break;
        	}
		}
		return maxValue;
   }
};
module.exports = Barrage;