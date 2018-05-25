"use strict";

//无分数情况，按加入游戏时间排序
function sortDesc(player_a, player_b) {
	if (player_a["timestamp"] <= player_b["timestamp"]) {
		return -1;
	}else {
		return 1;
	}
};

//分数为主、加入时间为辅
function sortDescEx(player_a, player_b) {
	if (compareScore(player_a, player_b) > 0) {
		return -1;
	} else if (compareScore(player_a, player_b) == 0) {
		if (player_a["timestamp"] <= player_b["timestamp"]) {
			return -1;
		}else {
			return 1;
		}
	}else {
		return 1;
	}
};

//分数和时长对比
function compareScore(player_a, player_b) {
	var result_a = player_a["score"];
	var result_b = player_b["score"];
	
	if (result_a["score"] > result_b["score"]) {
		return 1;
	} else if (result_a["score"] === result_b["score"]) {
		if (result_a["duration"] < result_b["duration"]) {
			return 1;
		} else if (result_a["duration"] == result_b["duration"]) {
			return 0;
		} else {
			return -1;
		}
	}else {
		return -1;
	}
};

//对象属性值搜索
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

var EatPeasChallengeContract = function() {
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

EatPeasChallengeContract.prototype = {
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
		if (!round_id || round_id.trim() === "") {
			throw new Error("Parameter Error!");
		}
		
		var challenge_round_info = this.challenge_rounds.get(round_id);
		if (!challenge_round_info) {
			throw new Error("Challenge Error!");
		}
		
		var player_list = [];
		var records = challenge_round_info["records"];
		
		for (var idx = 0; idx < records.length; idx++) {
			var record = this.challenge_records.get(records[idx]);
			
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
		
		//对同一个用户参与多次进行过滤
		for (var idx = 0; idx < playerList.length; idx++) {
			var findIdx = findElem(search_arr, "player", playerList[idx]["player"]);
			if (findIdx >= 0) {
				var current_player = playerList[idx];
				if (!current_player || !current_player["score"]) {
					continue;
				}
				
				var previous_player = search_arr[findIdx];
				if (!previous_player["score"] || compareScore(current_player, previous_player) > 0) {
					search_arr[findIdx] = current_player;
				}
			} else {
				search_arr.push(playerList[idx]);
			}
		}
		
		//拆分正常结束游戏玩家和异常未结束游戏玩家，并排序
		var played_arr = new Array;
		var playing_arr = new Array;
		
		for (var ind = 0; ind < search_arr.length; ind++) {
			if (search_arr[ind]["score"]) {
				played_arr.push(search_arr[ind]);
			} else {
				playing_arr.push(search_arr[ind]);
			}
		}
		
		played_arr.sort(sortDescEx);
		playing_arr.sort(sortDesc);
		
		return played_arr.concat(playing_arr);
	},
	
	//创建一个新的游戏场次
	newGameround: function(round_id, begin_end_time) {	
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
		
		var round_count = new BigNumber(this.round_count).plus(1);
		this.round_count = round_count;	
		this.id_challenge_round.set(round_count, round_id);
	},
	
	//获取当前场次信息
	getCurrentGameRound: function() {
		var challenge_round_info = this.challenge_rounds.get(this.round_id);
		if (!challenge_round_info) {
			return {"rid": "", "bgEdTime": "", "playeNum": 0, "bonus": 0};
		} 
		
		var bonus = WEI2NAS(challenge_round_info["bonus"]);
		var player_arr = this._getPlayerList(this.round_id);
		var playeNum = this._SortPlayerList(player_arr).length;
		
		return {"rid": challenge_round_info["rid"], "bgEdTime": challenge_round_info["bgEdTime"], "playeNum": playeNum, "bonus": bonus};
	},
	
	//获取最近N个场次列表
	getGameRoudList: function(count) {
		if (!IsDigit(count)) {
			throw new Error("Parameter Error!");
		}
		
		var round_count = this.round_count;
		if (count > round_count) {
			count = round_count;
		}
			
		var roud_list = [];
		for (var idx = round_count; idx > 0 && count > 0; idx--, count--) {
			var round_id = this.id_challenge_round.get(idx);
			roud_list.push(round_id);
		}
		
		return roud_list;
	},
	
	//获取单个场次TOPN排名
	getGameRoundTopN: function(round_id, count) {
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
		
		var TopNList = [];
		for (var idx = 0; idx < count; idx++) {
			TopNList.push(player_list[idx]);
		}
		
		return {"playeNum": length, "bonus": WEI2NAS(challenge_round_info["bonus"]), "topN": TopNList};
	},
	
	//玩家进入游戏
	enterGameRound: function(startTime) {		
		if (!startTime || startTime.trim() === "") {
			throw new Error("Parameter Error!");
		}
				
		var bonus = parseFloat(Blockchain.transaction.value);
		if (WEI2NAS(bonus) < this.round_amount) {
			throw new Error("Bonus Error!");
		}
			
		var challenge_round_info = this.challenge_rounds.get(this.round_id);
		if (!challenge_round_info) {
			throw new Error("Challenge Error!");
		}
		
		var bgEdTimeArr = challenge_round_info["bgEdTime"].split("-");
		var lnBeginTime = parseInt(bgEdTimeArr[0]);
		var lnEndTime = parseInt(bgEdTimeArr[1]);
		var lnJoinTime = parseInt(startTime);
		if (lnJoinTime < lnBeginTime || lnJoinTime > lnEndTime) {
			throw new Error("Parameter Error!");
		}
		
		var records = challenge_round_info["records"];
		var player = Blockchain.transaction.from;
		
		var record_count = new BigNumber(this.record_count).plus(1);
		this.record_count = record_count;
		var timestamp = new Date().getTime();
		var record = {"rid": this.round_id, "player": player, "startTime": startTime, "bonus": bonus, "timestamp": timestamp};
		this.challenge_records.set(record_count, record);
		
		records.push(record_count);
		challenge_round_info["records"] = records;
		
		var bonus_pool_value = parseFloat(challenge_round_info["bonus"]);
		bonus_pool_value += bonus;
		challenge_round_info["bonus"] = bonus_pool_value;
		
		this.challenge_rounds.set(this.round_id, challenge_round_info);
	},
	
	//玩家离开游戏，更新得分
	leaveGameRound: function(round_id, result) {	
		try {
			if (!round_id || round_id.trim() === "") {
				throw new Error("Parameter error!");
			}
			
			if (!result || !result["score"] || !result["duration"]) {
				throw new Error("Parameter error!");
			}
			
			var challenge_round_info = this.challenge_rounds.get(round_id);
			if (!challenge_round_info) {
				throw new Error("Challenge Error!");
			}
			
			var player = Blockchain.transaction.from;
			var current_socre_record = {"rid": round_id, "score": result};
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

			var record = this.challenge_records.get(record_id);
			if (!record) {
				throw new Error("Inner error, don't found record!");
			}

			record["score"] = result;
			this.challenge_records.set(record_id, record);
		} catch (err) {
			throw new Error("leaveGameRound() catch an exception.");
		}
	},
	
	//结束一个游戏场次，并进行结算
	endGameRound: function(round_id) {
		if (!round_id || round_id.trim() === "") {
			throw new Error("Parameter Error!");
		}

		var challenge_round_info = this.challenge_rounds.get(round_id);
		if (!challenge_round_info) {
			throw new Error("Challenge Error!");
		}
		
		var bonus_pool_value = challenge_round_info["bonus"];
		if (!bonus_pool_value) {
			return false;
		}
		
		var amount = bonus_pool_value;
		var player = this.getGameRoundWinner(round_id);
		if (player["score"]) {			
			amount = amount * 0.8;
			var res = Blockchain.transfer(player["player"], amount);
			if (!res) {
				throw new Error("transfer to winner's wallet failed:" + player["player"] + "," + amount);
			}
			
			amount = bonus_pool_value - amount;
		}
       
        var result = Blockchain.transfer(this.admin, amount);
		if (!result) {
			throw new Error("transfer to admin's wallet failed:" + this.admin + "," + amount);
		}
	},
	
	//获取单个场次获胜者
	getGameRoundWinner: function(round_id) {
		var player_arr = this._getPlayerList(round_id);
		var player_list = this._SortPlayerList(player_arr);
		
		return player_list[0];
	},
	
	//获取单个场次玩家游戏记录
	getGameRoundDetail: function(round_id) {
		var challenge_round_info = this.challenge_rounds.get(round_id);
		if (!challenge_round_info) {
			throw new Error("round_id Error!");
		}
				
		var records = challenge_round_info["records"];
		var player = Blockchain.transaction.from;
		
		return this._getPlayerDetail(player, records);
	},
	
	//获取玩家历史得分记录
	getPlayHighestRecord: function() {
		var player = Blockchain.transaction.from;
		return this.highest_socre_records.get(player);
	},
};

module.exports = EatPeasChallengeContract;