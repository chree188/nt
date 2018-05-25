"use strict";
var popularizeContract = function() {
  LocalContractStorage.defineMapProperty(this, "publish");
  LocalContractStorage.defineMapProperty(this, "saving");
  LocalContractStorage.defineProperty(this, "cnt", null);
  LocalContractStorage.defineProperty(this, "admin", null);
}

popularizeContract.prototype = {
  init: function() {
    this.cnt = 0;
	this.admin = Blockchain.transaction.from;
  },

  publishCollection: function(name, total, days, start, rate_by_day, min, max, max_trans_num) {
	if (Blockchain.transaction.from !== this.admin){
		return false;
	}

	total = new BigNumber(total);
	days = new BigNumber(days);
	rate_by_day = new BigNumber(rate_by_day);
	min = new BigNumber(min);
	max = new BigNumber(max);
	max_trans_num = new BigNumber(max_trans_num);

	var base_info = {"name": name, "total": total, "days": days, "start": start, "rate_by_day": rate_by_day,  "min": min, "max": max, "max_trans": max_trans_num};
	this.publish.set(this.cnt, base_info);
	this.cnt += 1;
	return true;
  },

  toCollection: function(id){
	var value = new BigNumber(Blockchain.transaction.value);
    var address = Blockchain.transaction.from;

	id = new BigNumber(id);
	var base_info = this.publish.get(id);
	if (!base_info){
		throw new Error("No such id!");
	}
	var user_map = this.saving.get(id);
	if (!user_map){
		user_map = {"cnt": 0, "users": {}, "user_id_map": {}};
	}
	
	var this_user = user_map["users"][address];
	if (!this_user){
		this_user = {"in": value, "out": 0, "lock": 0};
		user_map["user_id_map"][user_map["cnt"]] = address;
		user_map["cnt"] += 1;
	}
	else {
		var income = new BigNumber(this_user["in"])
		this_user["in"] = income.plus(value);
	}
	user_map["users"][address] = this_user;
	this.saving.set(id, user_map);

	return true;
  },

  transferToAdmin: function(value){
	if (Blockchain.transaction.from !== this.admin){
		throw new Error("not admin user.");
	}
	var result = Blockchain.transfer(this.admin, value);
	if(!result){
		throw new Error("transfer failed.");
	}
	return true;
  },

  transferback: function(id, to, value){
	var address = Blockchain.transaction.from;
	if(address !== this.admin){
		return false;
	}
	var user_map = this.saving.get(id);
	if(!user_map){
		throw new Error("No such id!");
	}

	var this_user = user_map["users"][to];
	if(!this_user){
		throw new Error("No such address!");
	}

	value = new BigNumber(value);
	if (this_user["lock"]){
		throw new Error("locked.");
	}
	var result = Blockchain.transfer(to, value);
	if(!result){
		throw new Error("transfer failed.");
	}
	var outcome = new BigNumber(this_user["out"]);
	this_user["out"] = outcome.plus(value);
	this_user["lock"] = 1;
    user_map["users"][to] = this_user;
	this.saving.set(id, user_map);
	return true;
  },
  
  transferbackForce: function(id, to, value){
	var address = Blockchain.transaction.from;
	if(address !== this.admin){
		return false;
	}
	var user_map = this.saving.get(id);
	if(!user_map){
		throw new Error("No such id!");
	}

	var this_user = user_map["users"][to];
	if(!this_user){
		throw new Error("No such address!");
	}

	value = new BigNumber(value);

	var result = Blockchain.transfer(to, value);
	if(!result){
		throw new Error("transfer failed.");
	}
	var outcome = new BigNumber(this_user["out"]);
	this_user["out"] = outcome.plus(value);
    user_map["users"][to] = this_user;
	this.saving.set(id, user_map);
	return true;
  },
  
  getPublish: function(id){
	  return this.publish.get(id);
  },

  getPublishMore: function(start, end){
    var data = {};
	for (var i = start; i < end; i++){
		data[i] = this.publish.get(i);
	}
	return data;
  },

  getSaving: function(id){
	  return this.saving.get(id);
  },

  getSavingCnt: function(id){
	  var user_map = this.saving.get(id);
	  return user_map["cnt"];
  },

  getSavingMulty: function(id, start, cnt){
		var user_map = this.saving.get(id);
		var max = user_map["cnt"];
		start = start;
		if (start > max){
			return {"ret": 0, "data": []};
		}
		cnt = cnt;
		if (cnt > 1024){
			cnt = 1024;
		}
		var end = start + cnt;
		if (end > max){
			end = max;
		}
		var data = [];
		
		for (var i = start; i < end; i++){
			var address = user_map["user_id_map"][i];
			var one = user_map["users"][address];
			one["add"] = address;
			data.push(one);
		}
		return {"ret": 0, "data": data};
  },

  getSavingByAddress: function(id, address){
	  var user_map = this.saving.get(id);
	  return user_map["users"][address];
  },

  getCnt: function(){
	  return [this.cnt, this.admin];
  },
  
  getAddress: function(){
	return Blockchain.transaction.from;
  },
}

module.exports = popularizeContract