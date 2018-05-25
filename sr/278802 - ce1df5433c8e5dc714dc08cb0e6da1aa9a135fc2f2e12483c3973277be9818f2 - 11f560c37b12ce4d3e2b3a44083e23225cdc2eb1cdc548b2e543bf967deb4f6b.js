"use strict";

function sortDesc(player_a, player_b) {
	if (player_a["timestamp"] <= player_b["timestamp"]) {
		return -1;
	}else {
		return 1;
	}
};

function sortDescEx(player_a, player_b) {
	if (player_a["score"] > player_b["score"]) {
		return -1;
	} else if (player_a["score"] === player_b["score"]) {
		if (player_a["timestamp"] <= player_b["timestamp"]) {
			return -1;
		}else {
			return 1;
		}
	}else {
		return 1;
	}
};

function compareScore(player_a, player_b) {
	if (player_a["score"] > player_b["score"]) {
		return 1;
	} else if (player_a["score"] === player_b["score"]) {
		return 0;
	}else {
		return -1;
	}
};

function findElem(arrayToSearch, attr, val) {
    for (var idx = 0; idx < arrayToSearch.length; idx++) {
		if(arrayToSearch[idx][attr] === val) {
            return idx;
        }
    }
    return -1;
};

function IsDigit(str) {
	if (!str) {
		return false;
	}
	
	var type = typeof(str);
	if (type === "number") {
		return true;
	}
	
	var digits = [];
	var dpoints = [];
	
	for (var i = 0; i < str.length; i++) {
		if (str[i] >= 0 && str[i] <= 9) {
			digits.push(i);
			continue;
		}else if (str[i] === ".") {
			dpoints.push(i);
		}else {
			return false;
		}
	}
	
	if (digits.length < 1) {
		return false;
	}
	
	if (dpoints.length > 1) {
		return false;
	}
	
    return true;
};

function NAS2WEI(bonus) {
	return bonus * Math.pow(10,18);
};

function WEI2NAS(bonus) {
	return bonus / Math.pow(10,18);
};

function mylog() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift("ColorBlastChallengeContract-->")
    console.log.apply(console, args);
};

var ColorBlastChallengeContract = function() {
	LocalContractStorage.defineMapProperty(this, "challenge_records");
	LocalContractStorage.defineMapProperty(this, "highest_socre_records", null);
	LocalContractStorage.defineProperty(this, "record_count", null);	
	
	LocalContractStorage.defineMapProperty(this, "challenge_rounds");
	LocalContractStorage.defineMapProperty(this, "id_challenge_round");
	LocalContractStorage.defineProperty(this, "round_count", null);
	
	LocalContractStorage.defineProperty(this, "round_amount", null);
	LocalContractStorage.defineProperty(this, "round_id", null);
	LocalContractStorage.defineProperty(this, "admin", null);
};

ColorBlastChallengeContract.prototype = {
	init: function(round_amount) {
		if (round_amount) {
			this.round_amount = round_amount;
		}else {
			this.round_amount = 0.0001;
		}
		
		this.round_id = "";
		this.record_count = 0;
		this.round_count = 0;
		this.admin = Blockchain.transaction.from;
	},
	
	_getPlayerList: function(round_id) {
		mylog("_getPlayerList() -- 1:" + round_id);	
		if (!round_id || round_id.trim() === "") {
			throw new Error("Parameter Error!");
		}
		
		var challenge_round_info = this.challenge_rounds.get(round_id);
		if (!challenge_round_info) {
			throw new Error("Challenge Error!");
		}
		mylog("_getPlayerList() -- 2:" + challenge_round_info["rid"] + " === " + challenge_round_info["records"].join(","));
		
		var player_list = [];
		var records = challenge_round_info["records"];
		
		for (var idx = 0; idx < records.length; idx++) {
			var record = this.challenge_records.get(records[idx]);
			mylog("_getPlayerList() -- 3:" + idx + "," + records[idx] + "," + record["rid"] + "," + record["player"] + "," + record["startTime"] + "," + record["score"]);
			
			player_list.push(record);
		}
		
		return player_list;
	},
	
	_getPlayer: function(player, records) {
		for(var idx = 0; idx < records.length; idx++) {
			var record = this.challenge_records.get(records[idx]);
			if (player === record["player"] && !record["score"]) {
				return records[idx];
			}
		}
		
		return -1;
	},
	
	_getPlayerDetail: function(player, records) {
		var result = [];
		
		for(var idx = 0; idx < records.length; idx++) {
			var record = this.challenge_records.get(records[idx]);
			if (player === record["player"]) {
				result.push(record);
			}
		}
		
		return result;
	},
	
	_SortPlayerList: function(playerList) {
		var search_arr = new Array;
		
		mylog("_SortPlayerList() -- 1: " + playerList);	
		for (var idx = 0; idx < playerList.length; idx++) {
			var findIdx = findElem(search_arr, "player", playerList[idx]["player"]);
			if (findIdx >= 0) {
				var score = playerList[idx]["score"];
				if (!score) {
					continue;
				}
				
				var player = search_arr[findIdx];
				if (!player["score"] || score > player["score"]) {
					search_arr[findIdx] = playerList[idx];
				}
			} else {
				search_arr.push(playerList[idx]);
			}
		}
		mylog("_SortPlayerList() -- 2: " + search_arr);
		
		var played_arr = new Array;
		var playing_arr = new Array;
		
		for (var ind = 0; ind < search_arr.length; ind++) {
			if (search_arr[ind]["score"]) {
				played_arr.push(search_arr[ind]);
			} else {
				playing_arr.push(search_arr[ind]);
			}
		}
		
		mylog("_SortPlayerList() -- 3: " + played_arr + playing_arr);
		played_arr.sort(sortDescEx);
		playing_arr.sort(sortDesc);
		mylog("_SortPlayerList() -- 4: " + played_arr + playing_arr);
		
		return played_arr.concat(playing_arr);
	},
	
	beginChallenge: function(round_id, begin_end_time) {
		mylog("beginChallenge() -- 1:" + round_id + ", " + begin_end_time);
		
		if (!round_id || round_id.trim() === "" 
		|| !begin_end_time || begin_end_time.trim() === "") {
			throw new Error("Parameter Error!");
		}
		
		var challenge_round_info = this.challenge_rounds.get(round_id);
		if (challenge_round_info) {
			throw new Error("round_id existed!");
		}
		this.round_id = round_id;
					
		challenge_round_info = {"rid": round_id, "bgEdTime": begin_end_time, "bonus": 0, "records": []};
		this.challenge_rounds.set(round_id, challenge_round_info);
		mylog("beginChallenge() -- 2:" + challenge_round_info["rid"] + ", " + challenge_round_info["bgEdTime"] + ", " + challenge_round_info["bonus"]);		
		
		var round_count = new BigNumber(this.round_count).plus(1);
		this.round_count = round_count;	
		this.id_challenge_round.set(round_count, round_id);
		mylog("beginChallenge() -- 3:" + this.round_count);
	},
	
	getCurrentChallengeInfo: function() {
		var challenge_round_info = this.challenge_rounds.get(this.round_id);
		if (!challenge_round_info) {
			return {"rid": "", "bgEdTime": "", "playeNum": 0, "bonus": 0};
		} 
		mylog("getCurrentChallengeInfo():" + challenge_round_info["rid"] + ", " + challenge_round_info["bgEdTime"] + ", " + challenge_round_info["bonus"] + " === " + challenge_round_info["records"].join(","));
		
		var bonus = WEI2NAS(challenge_round_info["bonus"]);
		var playeNum = challenge_round_info["records"].length;
		
		return {"rid": challenge_round_info["rid"], "bgEdTime": challenge_round_info["bgEdTime"], "playeNum": playeNum, "bonus": bonus};
	},
	
	getRoudList: function(count) {
		mylog("getRoudList() -- 1:" + count);
		if (!IsDigit(count)) {
			throw new Error("Parameter Error!");
		}
		
		var round_count = this.round_count;
		if (count > round_count) {
			count = round_count;
		}
		mylog("getRoudList() -- 2:" + count);
			
		var roud_list = [];
		for (var idx = round_count; idx > 0 && count > 0; idx--, count--) {
			var round_id = this.id_challenge_round.get(idx);
			mylog("getRoudList() -- 3:" + idx + " === " + round_id);
			roud_list.push(round_id);
		}
		
		return roud_list;
	},
	
	getRoundTopN: function(round_id, count) {
		mylog("getRoundTopN() -- 1:" + round_id + ", " + count);
		var player_arr = this._getPlayerList(round_id);
		var player_list = this._SortPlayerList(player_arr);
		
		var challenge_round_info = this.challenge_rounds.get(round_id);
		if (!challenge_round_info) {
			throw new Error("Challenge Error!");
		}
		
		var length = player_list.length;
		if (count > length) {
			count = length;
		}
		mylog("getRoundTopN() -- 2:" + round_id + ", " + count);
		
		var TopNList = [];
		for (var idx = 0; idx < count; idx++) {
			TopNList.push(player_list[idx]);
		}
		
		return {"playeNum": length, "bonus": WEI2NAS(challenge_round_info["bonus"]), "topN": TopNList};
	},
	
	joinChallenge: function(startTime) {
		mylog("joinChallenge() -- 1:" + startTime);
		
		if (!startTime || startTime.trim() === "") {
			throw new Error("Parameter Error!");
		}
		
		mylog("joinChallenge() -- xxx:" + Blockchain.transaction.value);		
		var bonus = parseFloat(Blockchain.transaction.value);
		if (WEI2NAS(bonus) < this.round_amount) {
			throw new Error("Bonus Error!");
		}	
		mylog("joinChallenge() -- xxx:" + bonus);
			
		var challenge_round_info = this.challenge_rounds.get(this.round_id);
		if (!challenge_round_info) {
			throw new Error("Challenge Error!");
		}
		mylog("joinChallenge() -- 2:" + this.round_id + ", " + challenge_round_info["bonus"]);
		
		var bgEdTimeArr = challenge_round_info["bgEdTime"].split("-");
		var lnBeginTime = parseInt(bgEdTimeArr[0]);
		var lnEndTime = parseInt(bgEdTimeArr[1]);
		var lnJoinTime = parseInt(startTime);
		if (lnJoinTime < lnBeginTime || lnJoinTime > lnEndTime) {
			throw new Error("Parameter Error!");
		}
		
		var records = challenge_round_info["records"];
		var player = Blockchain.transaction.from;
		mylog("joinChallenge() -- 3:" + player + " === " + records.join(","));
		
		var record_count = new BigNumber(this.record_count).plus(1);
		this.record_count = record_count;
		var timestamp = Blockchain.transfer.timestamp;
		var record = {"rid": this.round_id, "player": player, "startTime": startTime, "bonus": bonus, "timestamp": timestamp};
		this.challenge_records.set(record_count, record);
		console.log("joinChallenge() -- 4:" + record["rid"] + ", " + record["player"] + ", " + record["startTime"] + ", " + record["bonus"]);
		
		records.push(record_count);
		challenge_round_info["records"] = records;
		console.log("joinChallenge() -- 5:" + record_count + " === " + records.join(",") + " === " + challenge_round_info["records"].join(","));
		
		var bonus_pool_value = parseFloat(challenge_round_info["bonus"]);
		mylog("joinChallenge() -- xxx:" + bonus_pool_value);
		bonus_pool_value += bonus;
		challenge_round_info["bonus"] = bonus_pool_value;
		mylog("joinChallenge() -- xxx:" + bonus_pool_value);
		
		this.challenge_rounds.set(this.round_id, challenge_round_info);
		mylog("joinChallenge() -- 6:" + challenge_round_info["rid"] + ", " + challenge_round_info["bonus"] + " === " + challenge_round_info["records"].join(","));
	},
	
	updateChallenge: function(round_id, score) {
		mylog("updateChallenge() -- 1:" + round_id + ", " + score);
		if (!round_id || round_id.trim() === "") {
			throw new Error("Parameter Error!");
		}
		
		if (!IsDigit(score)) {
			throw new Error("Parameter Error!");
		}
		score = parseInt(score);
		
		var challenge_round_info = this.challenge_rounds.get(this.round_id);
		if (!challenge_round_info) {
			throw new Error("Challenge Error!");
		}
		mylog("updateChallenge() -- 2:" + challenge_round_info["id"]);
		
		var player = Blockchain.transaction.from;
		var current_socre_record = {"rid": round_id, "highestScore": score};
		var highest_socre_record = this.highest_socre_records.get(player);
		if (highest_socre_record) {
			if (compareScore(current_socre_record, highest_socre_record) > 0) {
				this.highest_socre_records.set(player, current_socre_record);
			}
		} else {
			this.highest_socre_records.set(player, current_socre_record);
		}
		
		var records = challenge_round_info["records"];
		var player = Blockchain.transaction.from;
		var record_id = this._getPlayer(player, records);
		if (record_id < 0) {
			throw new Error("Not joined!");
		}
		mylog("updateChallenge() -- 3:" + player + ", " + record_id + " === " + records.join(","));
		
		var record = this.challenge_records.get(record_id);
		if (!record) {
			throw new Error("Inner error, don't found record!");
		}
		mylog("updateChallenge() -- 4:" + record["rid"] + ", " + record["player"] + ", " + record["startTime"] + ", " + record["bonus"]);
		
		record["score"] = score;
		this.challenge_records.set(record_id, record);	
		mylog("updateChallenge() -- 5:" + record["rid"] + ", " + record["player"] + ", " + record["startTime"] + ", " + record["bonus"] + ", " + record["score"]);
	},
	
	finishChallenge: function(round_id) {
		mylog("finishChallenge() -- 1:" + round_id);
		if (!round_id || round_id.trim() === "") {
			throw new Error("Parameter Error!");
		}

		var challenge_round_info = this.challenge_rounds.get(round_id);
		if (!challenge_round_info) {
			throw new Error("Challenge Error!");
		}
		
		var bonus_pool_value = challenge_round_info["bonus"];
		if (!bonus_pool_value) {
			mylog("finishChallenge() -- 2: No bonus!");
			return false;
		}
		
		var amount = bonus_pool_value;
		var player = this.getWinner(round_id);
		if (player["score"]) {			
			amount = amount * 0.8;
			var res = Blockchain.transfer(player["player"], amount);
			if (!res) {
				throw new Error("transfer to winner's wallet failed:" + player["player"] + "," + amount);
			}
			mylog("finishChallenge() -- 3:" + player["player"] + "," + amount);
			
			amount = bonus_pool_value - amount;
		}
       
        var result = Blockchain.transfer(this.admin, amount);
		if (!result) {
			throw new Error("transfer to admin's wallet failed:" + this.admin + "," + amount);
		}
        mylog("finishChallenge() -- 4:" + this.admin + "," + amount);   
	},
	
	getWinner: function(round_id) {
		var player_arr = this._getPlayerList(round_id);
		var player_list = this._SortPlayerList(player_arr);
		
		return player_list[0];
	},
	
	getPlayerRoundDetail: function(round_id) {
		mylog("getPlayerRoundDetail() -- 1:" + round_id);	
		var challenge_round_info = this.challenge_rounds.get(round_id);
		if (!challenge_round_info) {
			throw new Error("round_id Error!");
		}
				
		var records = challenge_round_info["records"];
		var player = Blockchain.transaction.from;
		mylog("getPlayerRoundDetail() -- 2:" + player + " === " + records.join(","));
		
		return this._getPlayerDetail(player, records);
	},
	
	getPlayHighestDetail: function() {
		var player = Blockchain.transaction.from;
		return this.highest_socre_records.get(player);
	},
};

module.exports = ColorBlastChallengeContract;