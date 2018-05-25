"use strict";

var JumpModel = function(text) {
	if(text) {
		var obj = JSON.parse(text);
		this.winner = obj.winner; 
		this.address = obj.address; 
		this.point = obj.point;
		this.timestamp = obj.timestamp;
	} else {
		this.winner = '';
		this.address = '';
		this.point = 0;
		this.timestamp = 0;
	}
};

JumpModel.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var JumpContract = function () {
    LocalContractStorage.defineMapProperty(this, "repo");
};

JumpContract.prototype = {
    init: function () {
        // todo
    },

    set: function (winner, address, point) {

        winner = winner.trim();
        point = point.trim();
        if (winner === "" || point === ""){
            throw new Error("empty winner / score");
        }
        
        var from = Blockchain.transaction.from;
        var timestamp = Blockchain.block.timestamp;
        var list = this.getWinnerList(address);
        
        var jumpModel = new JumpModel();      
        jumpModel.winner = winner;
        jumpModel.address = from;
        jumpModel.point = point;
		jumpModel.timestamp = timestamp;
		list.push(jumpModel);
        this.repo.put(address, list);
    },
	getWinnerList:function (address) {
    		return this.repo.get(address) || [];
   	},
   	rankList:function (address) {
   		var list = this.getWinnerList(address);
   		for(var i=0;i<list.length-1;i++){
        for(var j=0;j<list.length-1-i;j++){
        	var md1 = list[j];
        	var md2 = list[j+1];
            if(parseInt(md1.point)>parseInt(md2.point)){
                var temp=list[j];
                list[j]=list[j+1];
                list[j+1]=temp;
            }
        }
    }
   		return list.reverse();
   	}
};
module.exports = JumpContract;