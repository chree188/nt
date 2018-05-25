'use strict';
var Info = function(text) {
	if(text) {
		var obj = JSON.parse(text); 
		this.zc = obj.zc; 
		this.dsje = obj.dsje; 
		this.timestamp = obj.timestamp; 
	} else {
		this.zc = "";
		this.dsje = 0;
		this.timestamp = 0;
	}
};

Info.prototype.toString = function() {
	return JSON.stringify(this)
};

var InfoContract = function() {

	LocalContractStorage.defineMapProperty(this, "infoMap", {
		parse: function(text) {
			return new Info(text);
		},
		stringify: function(o) {
			return o.toString();
		}
	});
	LocalContractStorage.defineMapProperty(this, "arrayMap");
};

InfoContract.prototype = {
	init: function() {
		this.arrayMap.set("size", 0);
		this.arrayMap.set("keys", []);
	},
	saveDs: function(zc, dsje) {
		zc = zc.trim();

		if(zc === "") {
			throw new Error("个人信息为空！");
		}

		var info = new Info();
		info.zc = zc;
		info.dsje = dsje;
		info.timestamp = new Date().getTime();
		var size = this.arrayMap.get("size") || 0;
		var keys = this.arrayMap.get("keys") || [];
		keys[keys.length] = info.timestamp;
		this.arrayMap.set("keys", keys);
		this.arrayMap.set("size", size + 1);
		this.arrayMap.set(info.timestamp, info);
	},
	get: function(key) {
		return this.arrayMap.get(key);
	},

	keys: function() {
		return this.arrayMap.get("keys") || [];
	},

	size: function() {
		return this.arrayMap.get("size") || 0;
	},

	dsList: function() {
		var result = [];
		var keys = this.keys();
		for(var i = 0; i < keys.length; i++) {
			result[i] = this.arrayMap.get(keys[i]);
		}
		return result;
	},
};
module.exports = InfoContract;