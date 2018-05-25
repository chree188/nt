"use strict";

// 捕获神经猫记录对象
var CatchCatItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.address = obj.address;
		this.score = obj.score;
	} else {
		this.address = "";
	    this.score = "";
	}
};


CatchCatItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};


var CatchCatContract = function () {

    LocalContractStorage.defineMapProperty(this, "each", {
        parse: function (text) {
            return new CatchCatItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

CatchCatContract.prototype = {
    init: function () {
		 
    },

    save: function (key, score) {

        key = key.trim();
        score = score.trim();
        if (key === "" || score === ""){
            throw new Error("empty key / score");
        }
        if (score.length > 128 || key.length > 128){
            throw new Error("key / score exceed limit length");
        }
		
		if(parseInt(score) < 11){
			 throw new Error("Contract call exception.");
		}

        var from = Blockchain.transaction.from;
        var catItem = this.each.get(from);
        if (catItem){
            // 已存在
			var old_score = catItem.score;
			if(parseInt(old_score) > parseInt(score)){
				catItem.score = score;
			}
        }else{
			// 新增
			catItem = new CatchCatItem();
			catItem.address = from;
			catItem.score = score;
		}
        this.each.put(from, catItem);
		
		//龙虎榜排名
		var ranks = LocalContractStorage.get("ranks");
		if(!ranks){
			ranks = new Array();
		}

		var inRank = false;
		var lth = ranks.length;
		console.log("ranks.length="+lth);

		for (var i = 0; i < lth; i++) {
		  var rank = ranks[i];
		  if(rank.address == from){
			  // 已有排名
			  inRank = true;
			  var old_score = rank.score;
			  if(parseInt(old_score) > parseInt(score)){
				  // 更新分数
				  ranks[i].score = score;
				  //刷新排名
				  ranks.sort(function(obj1, obj2) {
					if (parseInt(obj1.score) < parseInt(obj2.score)) {
						return -1;
					} else if (parseInt(obj1.score) > parseInt(obj2.score)) {
						return 1;
					} else {
						return 0;
					}
				  });
			  }
			  break;
		  }
		}
		if(!inRank){
			// 未有排名，与龙虎榜比较是否能上榜  20名
			if(lth >= 20){
				// 与最后一名比较
				var lastRank = ranks[lth -1];
				console.log("lastRank.score="+lastRank.score +",sort="+lastRank.sort);
				if(parseInt(lastRank.score) > parseInt(score)){
					// 上榜，先删最后一名
					ranks.pop();
					ranks.push(catItem);
					//刷新排名
					ranks.sort(function(obj1, obj2) {
						if (parseInt(obj1.score) < parseInt(obj2.score)) {
							return -1;
						} else if (parseInt(obj1.score) > parseInt(obj2.score)) {
							return 1;
						} else {
							return 0;
						}
					});
				}	
			}else{
				// 排名未够20名，添加数据
				ranks.push(catItem);
				//刷新排名
				ranks.sort(function(obj1, obj2) {
					if (parseInt(obj1.score) < parseInt(obj2.score)) {
						return -1;
					} else if (parseInt(obj1.score) > parseInt(obj2.score)) {
						return 1;
					} else {
						return 0;
					}
				});
			}
		}
		LocalContractStorage.set("ranks",ranks);
		
		return this.each.get(from);
    },

    get: function () {
		// 获取当前地址 成绩
		var from = Blockchain.transaction.from;
        return this.each.get(from);
    },
	getrank: function () {
		// 获取龙虎榜数据
		var ranks = LocalContractStorage.get("ranks");
		return ranks;
	},
	getrankbyfrom: function () {
		// 获取当前地址在龙虎榜的排名
		var from = Blockchain.transaction.from;
		var msg = "未上榜";
		var ranks = LocalContractStorage.get("ranks");
		if(!ranks){
			ranks = new Array();
		}
		var lth = ranks.length;
		console.log("ranks.length="+lth);
		
		if(lth > 0){
			for (var i = 0; i < lth; i++) {
				var obj = ranks[i];
				if(obj.address == from){
					msg = i+1;
				}
			}
		}
		return msg;
	}
};


module.exports = CatchCatContract;