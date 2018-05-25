"use strict";

var StarContract = function() {
	LocalContractStorage.defineMapProperty(this, "stars");
	LocalContractStorage.defineMapProperty(this, "mystars");
	LocalContractStorage.defineProperty(this, "order");
};

StarContract.prototype = {
	init: function() {
		this.order = 0;
	},
	save: function(content) {
		content = content.trim();
		if (content === "") {
			throw new Error("Empty");
		}
		var key = this.order;
		var obj = new Object();
		obj.index = key;
		obj.content = content;
		obj.author = Blockchain.transaction.from;
		obj.createdDate = Blockchain.transaction.timestamp;
		this.stars.set(key, JSON.stringify(obj));
		this.order += 1;
	},
	getStars: function() {
		var from = Blockchain.transaction.from;
		var myArr = [];
		for(var i=0; i<this.order; i++){
			var tempObj = JSON.parse(this.stars.get(i));
			myArr.push(tempObj);
		}
		return myArr;
	},
	addMy: function(index){
		var from = Blockchain.transaction.from;
		var tempObj = this.mystars.get(from);
		var myArr;
		if(tempObj == null){
			myArr = [];
			myArr.push(index);
		}else{
			myArr = JSON.parse(tempObj);
			if(myArr.indexOf(index) < 0){
				myArr.push(index);
			}
		}
		this.mystars.set(from, JSON.stringify(myArr));		
	},
	reMy: function(index){
		var from = Blockchain.transaction.from;
		var tempObj = this.mystars.get(from);
		var myArr;
		if(tempObj == null){
			throw new Error("Doesn't add this Stars in your list.");
		}else{
			myArr = JSON.parse(tempObj);
			var i = myArr.indexOf(index);
			if(i < 0){
				throw new Error("Doesn't add Stars in your list.");
			}else{
				myArr.splice(i, 1);
			}
		}
		this.mystars.set(from, JSON.stringify(myArr));		
	},
	getMy: function(){
		var from = Blockchain.transaction.from;
		var tempObj = this.mystars.get(from);
		var myArr = [];
		if(tempObj == null){
			return myArr;
		}else{
			var myLikeArr = JSON.parse(tempObj);
			for(var i=0; i<myLikeArr.length; i++){
				var temp = JSON.parse(this.stars.get(myLikeArr[i]));
				myArr.push(temp);
			}
		}

		return myArr;
	}
};

module.exports = StarContract;