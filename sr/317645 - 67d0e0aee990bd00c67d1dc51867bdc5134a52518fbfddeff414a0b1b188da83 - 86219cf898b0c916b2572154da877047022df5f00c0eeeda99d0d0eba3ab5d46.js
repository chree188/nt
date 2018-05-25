"use strict";

var BoardModel = function(text) {
	if(text) {
		var obj = JSON.parse(text);
		this.name = obj.name; 
		this.address = obj.address; 
		this.num = obj.num;
		this.time = obj.time;
	} else {
		this.name = '';
		this.address = '';
		this.num = 0;
		this.time = 0;
	}
};

BoardModel.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};


var BoardContract = function () {
    LocalContractStorage.defineMapProperty(this, "repo");
};


BoardContract.prototype = {
    init: function () {
        // todo
    },

    set: function (name, address, num) {

        name = name.trim();
        num = num.trim();
        if (name === "" || num === ""){
            throw new Error("empty name / num");
        }
        
        var from = Blockchain.transaction.from;
        var timestamp = Blockchain.block.timestamp;
        var list = this.list(address);
        
        var boardModel = new BoardModel();      
        boardModel.name = name;
        boardModel.address = from;
        boardModel.num = num;
		boardModel.time = time;
		list.push(boardModel);
        this.repo.put(address, list);
    },
	list:function (address) {
    		return this.repo.get(address) || [];
   	},
   	rankList:function (address) {
   		var list = this.list(address);
   		for(var i=0;i<list.length-1;i++){
        		for(var j=0;j<list.length-1-i;j++){
        			var mone = list[j];
        			var mtwo = list[j+1];
        			if(parseInt(mone.num)>parseInt(mtwo.num)){
                		var temp=list[j];
                		list[j]=list[j+1];
                		list[j+1]=temp;
            		}
        		}
   		}
   		return list.reverse();
   	}
};
module.exports = BoardContract;