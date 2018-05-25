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
	LocalContractStorage.defineMapProperty(this, "userDataArchive");
	LocalContractStorage.defineProperty(this, "contractOwner");
	LocalContractStorage.defineProperty(this, "minAmount", {
        stringify: function (obj) {
            return obj.toString()
        },
        parse: function (str) {
            return new BigNumber(str)
        }
	});
};
AnotherContract.prototype = {
    init: function() { 
    	this.userDataArchive.set("index", [])
    	this.contractOwner = "n1RejW1wtsQzp2hPuzfv1DUDtZV31xnNZVw";
    	this.minAmount = new BigNumber(0.1*10**18);
    },
    setName: function (id, name) {
    	if(typeof id == 'undefined' || typeof name == 'undefined' || id.length!=32 || !name.length) { return false };
    	var value = Blockchain.transaction.value;
    	if(value.lt(this.minAmount)) { return false };
    	if(this.starDataArchive.get(id) != null) { return false };
    	var user = Blockchain.transaction.from;
    	this.starDataArchive.set(id, {userId: user,
    		timestamp: Blockchain.transaction.timestamp,
    		name: name
    	});
    	var userStars = this.userDataArchive.get(user);
    	var index = this.userDataArchive.get("index");
    	if(userStars == null) {
    		userStars = [];
    		index.push(user);
    	}
    	userStars.push(id);
    	this.userDataArchive.set(user, userStars);
    	this.userDataArchive.set("index", index);
    	return true;
    },
    getStar: function(id) {
    	return {star: id, data: this.starDataArchive.get(id)}
    },
    getUserStars: function(user) {
    	var userStars = this.userDataArchive.get(user);
    	if(userStars == null) { return [] };
    	return userStars.map(this.getStar, this);
    },
    getArchive: function() {
    	var index = this.userDataArchive.get("index");
    	var result = []
    	for (var el of index) { result.push(...this.getUserStars(el)) };
    	return result
    }, 
    echo: function(){
    	return Blockchain.transaction.from
    }
};
module.exports = AnotherContract;