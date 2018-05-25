"use strict";

var PlayerModel = function(text) {
	if(text) {
		var obj = JSON.parse(text); // 如果传入的内容不为空将字符串解析成json对象
		this.name = obj.name; // 姓名
		this.address = obj.address; // 地址
		this.score = obj.score; //得分
		this.time = obj.time;
		this.timestamp = obj.timestamp; // 时间戳
	} else {
		this.title = '';
		this.address = '';
		this.score = 0;
		this.time = '';
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

    save: function (name, address, score, timestamp) {

        name = name.trim();
        score = score.trim();
        time = time.trim();
        timestamp = timestamp.trim();
        if (name === "" || score === "" || timestamp === ""){
            throw new Error("empty name / score / timestamp");
        }
        
        var from = Blockchain.transaction.from;
        var list = this.getList(address);
        var index = 0;
        
        var playerModel = new PlayerModel();
        playerModel.name = name;
        playerModel.address = from;
        playerModel.score = score;
        playerModel.time = time;
		playerModel.timestamp = timestamp;
		
		if (list.length > 0) {
        		for (var i = 0; i <list.length; i++) {
        			var pm = list[i];
        			if (parseInt(score) > parseInt(pm.score)) {
        				index = i;
        				break;
        			}
        		}
        }
		
		list.insert(index,playerModel);
        this.repo.put(address, list);
    },
	getList:function (address) {
    		return this.repo.get(address) || [];
   },
};
module.exports = PlayerContract;