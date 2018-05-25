"use strict";

var PlayerModel = function(text) {
	if(text) {
		var obj = JSON.parse(text);
		this.name = obj.name; 
		this.address = obj.address; 
		this.score = obj.score;
		this.timestamp = obj.timestamp;
	} else {
		this.title = '';
		this.address = '';
		this.score = 0;
		this.timestamp = 0;
	}
};

PlayerModel.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var PlayerContract = function () {
    LocalContractStorage.defineMapProperty(this, "repo");
};

PlayerContract.prototype = {
    init: function () {
        // todo
    },

    save: function (name, address, score) {

        name = name.trim();
        score = score.trim();
        if (name === "" || score === ""){
            throw new Error("empty name / score");
        }
        
        var from = Blockchain.transaction.from;
        var timestamp = Blockchain.block.timestamp;
        var list = this.getList(address);
        
        var playerModel = new PlayerModel();      
        playerModel.name = name;
        playerModel.address = from;
        playerModel.score = score;
		playerModel.timestamp = timestamp;
		list.push(playerModel);
        this.repo.put(address, list);
    },
	getList:function (address) {
    		return this.repo.get(address) || [];
   	},
   	ranking:function (address) {
   		var list = this.getList();
   		for(var i=0;i<list.length-1;i++){
        for(var j=0;j<list.length-1-i;j++){
            if(parseInt(list[j].score)>parseInt(arr[j+1].score)){
                var temp=list[j];
                list[j]=list[j+1];
                list[j+1]=temp;
            }
        }
    }
   		return list;
   	}
};
module.exports = PlayerContract;