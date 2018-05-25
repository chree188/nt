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
    setName: function () {
    	this.starDataArchive.put("a", 1);
        this.starDataArchive.put("a", 2);
    	return true;
    },
    getName: function(id) {
    	return this.starDataArchive.get(id)
    }
};
module.exports = AnotherContract;