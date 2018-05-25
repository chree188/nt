"use strict";

var ExpressLove = function() {
    LocalContractStorage.defineMapProperty(this, "dataMap");
};

ExpressLove.prototype = {
    init: function() {
		this.size = 0;
	},
	
    save: function(uuid, expressLoveWords) {
        uuid = uuid.trim();
		expressLoveWords = expressLoveWords.trim();

        if (uuid === "") {
            throw new Error("empty uuid");
        }
        if (expressLoveWords === "") {
            throw new Error("empty expressLoveWords");
        }
		
        var key = uuid;
		
		var obj = new Object();
        obj.expressLoveWords = expressLoveWords;
		obj.author = Blockchain.transaction.from;
		obj.createdDate = Blockchain.transaction.timestamp;
		
		this.dataMap.set(key, JSON.stringify(obj));
    },
	
    get: function(uuid) {
        uuid = uuid.trim();

        if (uuid === "") {
            throw new Error("empty uuid");
        }
		
        var key = uuid;
		var temp = this.dataMap.get(key);
		if(temp == null || temp == ""){
			return null;
		}
		
		return JSON.parse(temp);
    }
};

module.exports = ExpressLove;