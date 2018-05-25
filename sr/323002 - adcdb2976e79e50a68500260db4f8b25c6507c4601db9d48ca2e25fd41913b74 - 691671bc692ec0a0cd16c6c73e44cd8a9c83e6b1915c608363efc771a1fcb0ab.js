"use strict";
//by alldapp-dapps.ga
var DAppsga = function() {
	LocalContractStorage.defineMapProperty(this, "dapp");
	LocalContractStorage.defineMapProperty(this, "mydapp");
	LocalContractStorage.defineProperty(this, "dapporder");
};

DAppsga.prototype = {
	init: function() {
		this.dapporder = 0;
	},

	savedapp: function(content) {
		content = content.trim();
		if (content === "") {
			throw new Error("Empty DApp");
		}
		var key = this.dapporder;
		var obj = new Object();
		obj.index = key;
		obj.content = content;
		obj.author = Blockchain.transaction.from;
		obj.createdDate = Blockchain.transaction.timestamp;
		this.dapp.set(key, JSON.stringify(obj));
		this.dapporder += 1;
	},

	getdapp: function() {
		var from = Blockchain.transaction.from;
		var myDApp = [];
		for(var i=0; i<this.dapporder; i++){
			var tempObj = JSON.parse(this.dapp.get(i));
			myDApp.push(tempObj);
		}
		return myDApp;
	},

	addMydapp: function(index){
		var from = Blockchain.transaction.from;
		var tempObj = this.mydapp.get(from);
		var myDApp;
		if(tempObj == null){
			myDApp = [];
			myDApp.push(index);
		}else{
			myDApp = JSON.parse(tempObj);
			if(myDApp.indexOf(index) < 0){
				myDApp.push(index);
			}
		}
		this.mydapp.set(from, JSON.stringify(myDApp));		
	},

	unMydapp: function(index){
		var from = Blockchain.transaction.from;
		var tempObj = this.mydapp.get(from);
		var myDApp;
		if(tempObj == null){
			throw new Error("Doesn't add this dapp in your list.");
		}else{
			myDApp = JSON.parse(tempObj);
			var i = myDApp.indexOf(index);
			if(i < 0){
				throw new Error("Doesn't add dapp in your list.");
			}else{
				myDApp.splice(i, 1);
			}
		}
		this.mydapp.set(from, JSON.stringify(myDApp));		
	},

	getMydapp: function(){
		var from = Blockchain.transaction.from;
		var tempObj = this.mydapp.get(from);
		var myDApp = [];
		if(tempObj == null){
			return myDApp;
		}else{
			var myLikeArr = JSON.parse(tempObj);
			for(var i=0; i<myLikeArr.length; i++){
				var temp = JSON.parse(this.dapp.get(myLikeArr[i]));
				myDApp.push(temp);
			}
		}

		return myDApp;
	}
};

module.exports = DAppsga;