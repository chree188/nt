'use strict'

var AnotherContract = function () {
	LocalContractStorage.defineMapProperty(this, "starDataArchive", {
        stringify: function (obj) {
            return JSON.stringify(obj)
        },
        parse: function (str) {
            return JSON.parse(str)
        }
	}),
	LocalContractStorage.defineMapProperty(this, "userDataArchive"),
	LocalContractStorage.defineProperty(this, "archiveIndex");
};
AnotherContract.prototype = {
    init: function() { this.archiveIndex = []},
    setName: function (id, name) {
    	if(typeof id == 'undefined' || typeof name == 'undefined' || id.length!=32 || !name.length) { return false };
    	if(this.starDataArchive.get(id) != null) { return false };
    	var user = Blockchain.transaction.from;
    	this.starDataArchive.set(id, {userId: user,
    		timestamp: Blockchain.transaction.timestamp,
    		name: name
    	});
    	var userStars = this.userDataArchive.get(user);

    	if(userStars == null) {
    		userStars = [];
    		this.archiveIndex.push(user);
    	}
    	userStars.push(id);
    	this.userDataArchive.set(user, userStars);
    	return true;
    },
    getStar: function(id) {
    	return this.starDataArchive.get(id)
    },
    getUserStars: function(user) {
    	var userStars = this.userDataArchive.get(user);
    	if(userStars == null) { return [] };
    	return userStars.map(function(el){ return this.getStar(el)});
    },
    getArchive: function() {
    	return this.archiveIndex.map(function(el) { return {userId: el, data: this.getUserStars(el)}})
    }
};
module.exports = AnotherContract;