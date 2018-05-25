"use strict";

var BFModel = function(text) {
	if(text) {
		var obj = JSON.parse(text);
		this.pler = obj.pler; 
		this.address = obj.address; 
		this.value = obj.value;
		this.time = obj.time;
	} else {
		this.pler = '';
		this.address = '';
		this.value = 0;
		this.time = 0;
	}
};

BFModel.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var BFContract = function () {
    LocalContractStorage.defineMapProperty(this, "repo");
};


BFContract.prototype = {
    init: function () {
        // todo
    },

    set: function (pler, address, value) {

        pler = pler.trim();
        value = value.trim();
        if (pler === "" || value === ""){
            throw new Error("empty pler / value");
        }
        
        var from = Blockchain.transaction.from;
        var timestamp = Blockchain.block.timestamp;
        var list = this.bfList(address);
        
        var bFModel = new BFModel();      
        bFModel.pler = pler;
        bFModel.address = from;
        bFModel.value = value;
		bFModel.time = timestamp;
		list.push(bFModel);
        this.repo.put(address, list);
    },
   	rank:function (address) {
   		var list = this.bfList(address);
   		for(var i=0;i<list.length-1;i++){
        		for(var j=0;j<list.length-1-i;j++){
        			var bf0 = list[j];
        			var bf1 = list[j+1];
            		if(parseInt(bf0.value)>parseInt(bf1.value)){
                		var temp=list[j];
                		list[j]=list[j+1];
                		list[j+1]=temp;
            		}
        		}
    		}
   		return list.reverse();
   	},
   	bfList:function (address) {
    		return this.repo.get(address) || [];
   	}
};
module.exports = BFContract;