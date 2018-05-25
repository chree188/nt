'use strict'

var AnotherContract = function () {
	LocalContractStorage.defineMapProperty(this, "starDataArchive", {
        stringify: function (obj) {
            return JSON.stringify(obj)
        },
        parse: function (str) {
            return JSON.parse(str)
        }
	})
};
AnotherContract.prototype = {
    init: function() {},
    setName: function (id, name) {
    	if(typeof id == 'undefined' || typeof name == 'undefined' || id.length!=32 || !name.length) { return false };
    	if(this.starDataArchive.get(id) != null) { return false };
    	var from = Blockchain.transaction.from;
    	this.starDataArchive.set(id, {userId: Blockchain.transaction.from,
    		timestamp: Blockchain.transaction.timestamp,
    		name: name
    	})
    	return true;
    },
    getName: function(id) {
    	return this.starDataArchive.get(id)
    }
};
module.exports = AnotherContract;