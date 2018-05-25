'use strict'

var AnotherContract = function () {
	LocalContractStorage.defineMapProperty(this, "starArchive");
};

AnotherContract.prototype = {
    init: function() {},
    setName: function (id, name) {
        this.starArchive.set(id, name);
    	return true
    },
    getArchive: function() {
    	return this.starArchive
    },
    getKey: function(key) {
       return this.starArchive.get(key)
   }
};
module.exports = AnotherContract;