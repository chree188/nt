'use strict'

var AnotherContract = function () {
	LocalContractStorage.defineMapProperty(this, "starArchive", {
                      stringify: function (obj) {
            return JSON.stringify(obj)
        },
        parse: function (str) {
            return JSON.parse(str)
        }
});
};

AnotherContract.prototype = {
    init: function() {},
    setName: function (id, name) {
        this.starArchive.set(id, {a: name});
    	return true
    },
    getArchive: function() {
    	return this.starArchive
    },
    getKey: function(key) {
       let result = this.starArchive.get(key);
       result.a += 1;
       return result
   }
};
module.exports = AnotherContract;