"use strict";

// 跳跳仔记录对象
var JumpBoyItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.address = obj.address;
		this.score = obj.score;
	} else {
		this.address = "";
	    this.score = "";
	}
};


JumpBoyItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

function encode(start,end){
	var dcode = parseInt(start+"",8);
	var enst = encode64(dcode+"");
	var ened = encode64(end+"");

	return enst+"%"+ened;
}

function encode64(str) { 
	var val="";
　　for(var i = 0; i < str.length; i++){

　　	if(val == ""){
　　　　	val = str.charCodeAt(i).toString(16);
		}else{
　　　　　　val +="%" +  str.charCodeAt(i).toString(16);
		}
　　}
	return val;
}

var JumpBoyContract = function () {

    LocalContractStorage.defineMapProperty(this, "each", {
        parse: function (text) {
            return new JumpBoyItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

JumpBoyContract.prototype = {
    init: function () {
		 
    },

    save: function (key, score, nebdata) {

        key = key.trim();
        score = score.trim();
        if (key === "" || score === ""){
            throw new Error("empty key / score");
        }
        if (score.length > 128 || key.length > 128){
            throw new Error("key / score exceed limit length");
        }

		var neb = encode(key,score);
		if(neb != nebdata){
			throw new Error("Contract call fail illegal input.");
		}

        var from = Blockchain.transaction.from;
        var beanItem = this.each.get(from);
        if (beanItem){
            // 已存在
			var old_score = beanItem.score;
			if(parseInt(old_score) < parseInt(score)){
				beanItem.score = score;
			}
        }else{
			// 新增
			beanItem = new JumpBoyItem();
			beanItem.address = from;
			beanItem.score = score;
		}
        this.each.put(from, beanItem);
		
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
			  if(parseInt(old_score) < parseInt(score)){
				  // 更新分数
				  ranks[i].score = score;
				  //刷新排名
				  ranks.sort(function(obj1, obj2) {
					if (parseInt(obj1.score) > parseInt(obj2.score)) {
						return -1;
					} else if (parseInt(obj1.score) < parseInt(obj2.score)) {
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
			// 未有排名，比较是否能上榜 
			if(lth >= 20){
				// 与最后一名比较
				var lastRank = ranks[lth -1];
				console.log("lastRank.score="+lastRank.score +",sort="+lastRank.sort);
				if(parseInt(lastRank.score) < parseInt(score)){
					// 上榜，先删最后一名
					ranks.pop();
					ranks.push(beanItem);
					//刷新排名
					ranks.sort(function(obj1, obj2) {
						if (parseInt(obj1.score) > parseInt(obj2.score)) {
							return -1;
						} else if (parseInt(obj1.score) < parseInt(obj2.score)) {
							return 1;
						} else {
							return 0;
						}
					});
				}	
			}else{
				// 排名未够20名，添加数据
				ranks.push(beanItem);
				//刷新排名
				ranks.sort(function(obj1, obj2) {
					if (parseInt(obj1.score) > parseInt(obj2.score)) {
						return -1;
					} else if (parseInt(obj1.score) < parseInt(obj2.score)) {
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
	
	getLeaderboard: function () {
		// 获取当前地址在排行榜的排名
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
	},
	getrank: function () {
		// 获取排行榜数据
		var ranks = LocalContractStorage.get("ranks");
		return ranks;
	}
	
};


module.exports = JumpBoyContract;