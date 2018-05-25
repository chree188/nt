'use strict'

var AnotherContract = function () {
	LocalContractStorage.defineMapProperty(this, "starArchive");
};

AnotherContract.prototype = {
    init: function() {},
    setName: function (id, name) {
    	if(typeof id == 'undefined' || typeof name == 'undefined' || id.length!=32 || !name.length) { return false };
    	if(this.starArchive.get(id) != null) { return false };
    	var from = Blockchain.transaction.from;
    	this.starArchive.set(id, {userId: from, name: name, timestamp: Blockchain.transaction.timestamp});
    	return true;
    },
    getArchive: function() {
    	return this.starArchive;
    }
};
module.exports = AnotherContract;