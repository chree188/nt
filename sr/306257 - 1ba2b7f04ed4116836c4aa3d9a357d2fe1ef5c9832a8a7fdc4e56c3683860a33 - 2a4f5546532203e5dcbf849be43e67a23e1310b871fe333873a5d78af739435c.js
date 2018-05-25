"use strict";

var BalloonModel = function(text) {
	if(text) {
		var obj = JSON.parse(text);
		this.user = obj.user; 
		this.address = obj.address; 
		this.point = obj.point;
		this.timestamp = obj.timestamp;
	} else {
		this.user = '';
		this.address = '';
		this.point = 0;
		this.timestamp = 0;
	}
};

BalloonModel.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var BalloonContract = function () {
    LocalContractStorage.defineMapProperty(this, "repo");
};

BalloonContract.prototype = {
    init: function () {
        // todo
    },

    set: function (user, address, point) {

        user = user.trim();
        point = point.trim();
        if (winner === "" || point === ""){
            throw new Error("empty winner / score");
        }
        
        var from = Blockchain.transaction.from;
        var timestamp = Blockchain.block.timestamp;
        var list = this.getUserList(address);
        
        var balloonModel = new BalloonModel();      
        balloonModel.user = user;
        balloonModel.address = from;
        balloonModel.point = point;
		balloonModel.timestamp = timestamp;
		list.push(balloonModel);
        this.repo.put(address, list);
    },
	getUserList:function (address) {
    		return this.repo.get(address) || [];
   	},
   	rankUserList:function (address) {
   		var list = this.getUserList(address);
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
module.exports = BalloonContract;