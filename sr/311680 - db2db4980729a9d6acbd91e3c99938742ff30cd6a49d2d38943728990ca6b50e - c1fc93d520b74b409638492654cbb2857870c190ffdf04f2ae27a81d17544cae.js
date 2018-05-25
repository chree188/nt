"use strict";

var RabbitModel = function(text) {
	if(text) {
		var obj = JSON.parse(text);
		this.winner = obj.winner; 
		this.address = obj.address; 
		this.num = obj.num;
		this.timestamp = obj.timestamp;
	} else {
		this.winner = '';
		this.address = '';
		this.num = 0;
		this.timestamp = 0;
	}
};

RabbitModel.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var RabbitContract = function () {
    LocalContractStorage.defineMapProperty(this, "repo");
};

RabbitContract.prototype = {
    init: function () {
        // todo
    },

    saveInfo: function (winner, address, num) {

        winner = winner.trim();
        num = num.trim();
        if (winner === "" || num === ""){
            throw new Error("empty winner / num");
        }
        
        var from = Blockchain.transaction.from;
        var timestamp = Blockchain.block.timestamp;
        var list = this.getWinnerList(address);
        
        var rabbitModel = new RabbitModel();      
        rabbitModel.winner = winner;
        rabbitModel.address = from;
        rabbitModel.num = num;
		rabbitModel.timestamp = timestamp;
		list.push(rabbitModel);
        this.repo.put(address, list);
    },
	getWinnerList:function (address) {
    		return this.repo.get(address) || [];
   	},
   	ranking:function (address) {
   		var list = this.getWinnerList(address);
   		for(var i=0;i<list.length-1;i++){
        for(var j=0;j<list.length-1-i;j++){
        	var md1 = list[j];
        	var md2 = list[j+1];
            if(parseInt(md1.num)>parseInt(md2.num)){
                var temp=list[j];
                list[j]=list[j+1];
                list[j+1]=temp;
            }
        }
    }
   		return list.reverse();
   	}
};
module.exports = RabbitContract;