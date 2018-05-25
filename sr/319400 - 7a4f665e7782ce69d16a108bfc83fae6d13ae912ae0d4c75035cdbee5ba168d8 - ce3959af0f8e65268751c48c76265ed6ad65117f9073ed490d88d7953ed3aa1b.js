"use strict";

var FlyModel = function(text) {
	if(text) {
		var obj = JSON.parse(text);
		this.builder = obj.builder; 
		this.address = obj.address; 
		this.num = obj.num;
		this.timestamp = obj.timestamp;
	} else {
		this.builder = '';
		this.address = '';
		this.num = 0;
		this.timestamp = 0;
	}
};

FlyModel.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};


var FlyContract = function () {
    LocalContractStorage.defineMapProperty(this, "repo");
};


FlyContract.prototype = {
    init: function () {
        // todo
    },

    set: function (builder, address, num) {

        builder = builder.trim();
        num = num.trim();
        if (builder === "" || num === ""){
            throw new Error("empty builder / num");
        }
        
        var from = Blockchain.transaction.from;
        var timestamp = Blockchain.block.timestamp;
        var list = this.getBuilderList(address);
        
        var flyModel = new FlyModel();      
        flyModel.builder = builder;
        flyModel.address = from;
        flyModel.num = num;
		flyModel.timestamp = timestamp;
		list.push(flyModel);
        this.repo.put(address, list);
    },
	getBuilderList:function (address) {
    		return this.repo.get(address) || [];
   	},
   	rankArray:function (address) {
   		var list = this.getBuilderList(address);
   		for(var i=0;i<list.length-1;i++){
        for(var j=0;j<list.length-1-i;j++){
        	var m_1 = list[j];
        	var m_2 = list[j+1];
            if(parseInt(m_1.num)>parseInt(m_2.num)){
                var temp=list[j];
                list[j]=list[j+1];
                list[j+1]=temp;
            }
        }
    }
   		return list.reverse();
   	}
};
module.exports = FlyContract;