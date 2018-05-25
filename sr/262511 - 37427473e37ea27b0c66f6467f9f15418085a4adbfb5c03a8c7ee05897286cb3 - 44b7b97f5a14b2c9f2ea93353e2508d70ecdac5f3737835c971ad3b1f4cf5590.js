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
        var index = 0;
        
        var playerModel = new PlayerModel();
        
        if (list.length > 0) {
        		for (var i = 0; i <list.length; i++) {
        			var pm = list[i];
        			if (parseInt(score) > parseInt(pm.score)) {
        				index = i;
        				break;
        			}
        		}
        }
        
        playerModel.name = name;
        playerModel.address = from;
        playerModel.score = score;
		playerModel.timestamp = timestamp;
		list.splice(index,0,playerModel);
        this.repo.put(address, list);
    },
	getList:function (address) {
    		return this.repo.get(address) || [];
   },
};
module.exports = PlayerContract;