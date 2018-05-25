"use strict";

var SayData = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.key = obj.key;
		this.value = obj.value;
	} else {
	    this.key = "";
	    this.value = "";
	}
};

SayData.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var SayContract = function () {
    LocalContractStorage.defineMapProperty(this, "list", {
        parse: function (text) {
            return new SayData(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "arrayMap");
};

SayContract.prototype = {
    init: function () {
        this.arrayMap.set("size", 0);
        this.arrayMap.set("keys", ["子鼠","丑牛","寅虎","卯兔","辰龙","巳蛇","午马","未羊","申猴","酉鸡","戌狗","亥猪"]);

    },

    save: function (key, value, text) {
        key = key.trim();
        value = value.trim();
        if (key === "" || value === "") {
            throw new Error("empty key / value");
        }
        if (value.length > 64 || key.length > 64) {
            throw new Error("key / value exceed limit length")
        }

        var size = this.arrayMap.get("size") || 0;
        var keys = this.arrayMap.get("keys") || [];
        // keys[keys.length] = key;
        // this.arrayMap.set("keys", keys);
        this.arrayMap.set("size", size + 1);
        //
        // this.arrayMap.set(key, value);
    },
    get: function (key) {
        return this.arrayMap.get(key);
    },

    keys: function () {
        return this.arrayMap.get("keys") || [];
    },

    size: function () {
        return this.arrayMap.get("size") || 0;
    },

    listall: function () {
        var result = [];
        var keys = this.keys();
        for (var i = 0; i < keys.length; i++) {
            // result[i] = this.arrayMap.get(keys[i]);
            result[i] = keys[i];
        }
        return {"keys":this.keys(),"size":this.size()};
    }
};
module.exports = SayContract;