"use strict";

function mylog() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift("LotteryContract-->")
    console.log.apply(console, args);
};

function getArrayItems(arr, num) {
    var temp_array = new Array();
    for (var index in arr) {
        temp_array.push(arr[index]);
    }
    
    var return_array = new Array();
    for (var i = 0; i < num; i++) {
        if (temp_array.length > 0) {
            var arrIndex = Math.floor(Math.random()*temp_array.length);
            return_array[i] = temp_array[arrIndex];
            temp_array.splice(arrIndex, 1);
        } else {
            break;
        }
    }
	
    return return_array;
};

function diffArray(arr1, arr2) {
	var diff = [];
	var tmp = arr2.slice(0);
	
	arr1.forEach(function(val1, i) {
		if (arr2.indexOf(val1) < 0) {
			diff.push(val1);
		} else {
			tmp.splice(tmp.indexOf(val1), 1);
		}
	});
	
	return diff;
};

function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
            + " " + date.getHours() + seperator2 + date.getMinutes()
            + seperator2 + date.getSeconds();
    return currentdate;
};

var LotteryContract = function() {
	LocalContractStorage.defineMapProperty(this, "lotteries");
	LocalContractStorage.defineProperty(this, "lottery_cnt", null);
	
	LocalContractStorage.defineMapProperty(this, "id_users");
	LocalContractStorage.defineMapProperty(this, "id_lotteries");
	LocalContractStorage.defineProperty(this, "user_cnt", null);
};

LotteryContract.prototype = {
	init: function() {
		this.lottery_cnt = 0;
		this.user_cnt = 0;
	},
	
	_getLotteries: function() {
		var user = Blockchain.transaction.from;
		var lotteries = this.id_lotteries.get(user);
		
		mylog("_getLotteries():" + user + " === " + lotteries.join(","));
		
		return lotteries;
	},
	
	_startLottery: function(lottery) {
		var result = lottery["lottery"]["result"];
		if (result && result.length > 0) {
			return result;
		}
		
		var pool = lottery["lottery"]["employee"];
		var settings = lottery["lottery"]["settings"];
		var length = settings.length;
		
		result = new Array(length);	
		for (var idx = length - 1; idx >=0; idx--) {
			mylog("_startLottery() -- " + idx + ":" + settings[idx]["count"]);
			result[idx] = getArrayItems(pool, settings[idx]["count"]);
			pool = diffArray(pool, result[idx]);
			mylog("_startLottery() -- " + idx + ":" + result[idx].join(","));
		}

		return result;
	},
	
	newLottery: function(lotteryObj) {
		mylog("newLottery() -- 1:" + JSON.stringify(lotteryObj));
		if (!lotteryObj["title"] || !lotteryObj["employee"] || !lotteryObj["settings"]) {
			return new Error("Input Error(01)!");
		} else if (lotteryObj["title"].trim() === "" || lotteryObj["employee"].length < 1 || lotteryObj["settings"].length < 1) {
			return new Error("Input Error(02)!");
		} else if (!lotteryObj["settings"][0]["prize"] || !lotteryObj["settings"][0]["count"]) {
			return new Error("Input Error(03)!");
		}
		
		var lottery_cnt = new BigNumber(this.lottery_cnt).plus(1);
		this.lottery_cnt = lottery_cnt;
		var lottery = {"id": lottery_cnt, "timestamp": getNowFormatDate(), "lottery": lotteryObj};

		lottery["lottery"]["result"] = this._startLottery(lottery);	
		this.lotteries.set(lottery_cnt, lottery);
		mylog("newLottery() -- 2:" + JSON.stringify(lottery));
		
		var user = Blockchain.transaction.from;
		var lotteries = this.id_lotteries.get(user);
		
		if (!lotteries) {
			lotteries = [];
			
			var user_cnt = new BigNumber(this.user_cnt).plus(1);
			this.user_cnt = user_cnt;
			this.id_users.set(user_cnt, user);
		} 
		lotteries.push(lottery_cnt);
		this.id_lotteries.set(user, lotteries);
		mylog("newLottery() -- 3:" + user + "," + lottery_cnt + "," + this.user_cnt + " === " + lotteries.join(","));
	},
	
	getLotteryCount: function() {		
		return this._getLotteries().length;
	},
	
	listLottery: function(start, end) {
		mylog("listLottery() -- 1:" + start + ", " + end);
		
		var lotteryIds = this._getLotteries();
		var length = lotteryIds.length;
		
		if (start > length) {
			return new Error("start Error!");
		}
		
		if (start < 0) {
			start = 0;
		}
		
		if (end < 0 || end > length) {
			end = length;
		}
		mylog("listLottery() -- 2:" + start + ", " + end);
		
		var lotteries = [];
		for (var idx = start; idx < end; idx++) {
			mylog("listLottery() -- 3:" + idx + ", " + lotteryIds[idx]);
			lotteries.push(this.lotteries.get(lotteryIds[idx]));
		}
		
		return lotteries;
	},
	
	startLottery: function(lottery_id) {
		mylog("startLottery():" + lottery_id);
		
		var lottery = this.lotteries.get(lottery_id);
		if (!lottery) {
			return new Error("start Error!");
		}
		
		return this._startLottery(lottery);
	},
	
	getLatestLotteries: function(count) {
		mylog("getLatestLotteries() -- 1:" + count);
		
		var lotteryIds = this._getLotteries();
		var length = lotteryIds.length;
		
		if (count > length) {
			count = length;
		}
		
		mylog("getLatestLotteries() -- 2:" + count);
		
		var lotteries = [];
		for (var idx = length - 1; idx >=0 && count > 0; idx--, count--) {
			mylog("getLatestLotteries() -- 3:" + idx + ", " + lotteryIds[idx]);
			lotteries.push(this.lotteries.get(lotteryIds[idx]));
		}
		
		return lotteries;
	},
	
	getLottery: function(lottery_id) {
		mylog("getLottery():" + lottery_id);
		
		var lottery = this.lotteries.get(lottery_id);
		if (!lottery) {
			return new Error("start Error!");
		}
		
		return lottery;
	},
};

module.exports = LotteryContract;