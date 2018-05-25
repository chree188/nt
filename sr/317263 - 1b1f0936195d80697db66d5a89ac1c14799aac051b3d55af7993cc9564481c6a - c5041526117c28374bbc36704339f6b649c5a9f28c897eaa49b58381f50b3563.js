"use strict";

var RecordData = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.key = obj.key;
		this.value = obj.value;
	} else {
	    this.key = "";
	    this.value = "";
	}
};

RecordData.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var RecordContract = function () {
    LocalContractStorage.defineMapProperty(this, "list", {
        parse: function (text) {
            return new RecordData(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "arrayMap");
};

RecordContract.prototype = {
    init: function () {
        this.arrayMap.set("size", 0);
				this.arrayMap.set("keys", []);
    },

    save: function (key, value, text) {
		key = key.trim();
		value = value + '分' + '    玩家：' + Blockchain.transaction.from;
        value = value.trim();
        if (key === "" || value === ""){
            throw new Error("empty key / value");
        }
        if (value.length > 64 || key.length > 64){
            throw new Error("key / value exceed limit length")
        }

				var size = this.arrayMap.get("size") || 0;
				var keys = this.arrayMap.get("keys") || [];
				keys[keys.length] = key;
				this.arrayMap.set("keys", keys);
				this.arrayMap.set("size", size+1);

        this.arrayMap.set(key,value);
    },
    get: function (key) {
        return this.arrayMap.get(key);
    },

		keys: function(){
			return this.arrayMap.get("keys") || [];
		},

		size: function(){
			return this.arrayMap.get("size") || 0;
		},

		allRecords: function () {
			var result = [];
			var keys = this.keys();
			for(var i =0 ; i < keys.length; i++){
				result[i] = this.arrayMap.get(keys[i]);
			}
      return result;
  }
};
module.exports = RecordContract;