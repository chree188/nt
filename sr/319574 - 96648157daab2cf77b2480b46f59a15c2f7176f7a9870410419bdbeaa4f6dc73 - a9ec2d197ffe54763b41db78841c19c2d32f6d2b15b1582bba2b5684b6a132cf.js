"use strict";

var BoardModel = function(text) {
	if(text) {
		var obj = JSON.parse(text);
		this.wanjia = obj.wanjia; 
		this.address = obj.address; 
		this.num = obj.num;
		this.timestamp = obj.timestamp;
	} else {
		this.wanjia = '';
		this.address = '';
		this.num = 0;
		this.timestamp = 0;
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

    set: function (wanjia, address, num) {

        wanjia = wanjia.trim();
        num = num.trim();
        if (wanjia === "" || num === ""){
            throw new Error("empty wanjia / num");
        }
        
        var from = Blockchain.transaction.from;
        var timestamp = Blockchain.block.timestamp;
        var list = this.boardList(address);
        
        var boardModel = new BoardModel();      
        boardModel.wanjia = wanjia;
        boardModel.address = from;
        boardModel.num = num;
		boardModel.timestamp = timestamp;
		list.push(boardModel);
        this.repo.put(address, list);
    },
	
   	boardRand:function (address) {
   		var list = this.boardList(address);
   		for(var i=0;i<list.length-1;i++){
        		for(var j=0;j<list.length-1-i;j++){
        			var b1 = list[j];
        			var b2 = list[j+1];
            		if(parseInt(b1.num)>parseInt(b2.num)){
                		var temp=list[j];
                		list[j]=list[j+1];
                		list[j+1]=temp;
            		}
        		}
    		}
   		return list.reverse();
   	},
   	boardList:function (address) {
    		return this.repo.get(address) || [];
   	}
};
module.exports = BoardContract;