"use strict";

function SortAsc(hero_a, hero_b) {
	if (hero_a["score"] > hero_b["score"]) {
		return 1;
	} else if (hero_a["score"] === hero_b["score"]) {
		if (hero_a["time"] < hero_b["time"]) {
			return 1;
		}else if (hero_a["time"] === hero_b["time"]) {
			return 0;
		}else {
			return -1;
		}
	}else {
		return -1;
	}
};

function SortDesc(hero_a, hero_b) {
	if (hero_a["score"] > hero_b["score"]) {
		return -1;
	} else if (hero_a["score"] === hero_b["score"]) {
		if (hero_a["time"] < hero_b["time"]) {
			return -1;
		}else if (hero_a["time"] === hero_b["time"]) {
			return 0;
		}else {
			return 1;
		}
	}else {
		return 1;
	}
};

function isAllNaN(str) {
	for (var i = 0; i < str.length; i++) {
		if (str[i] >= 0 && str[i] <= 9) {
			continue;
		}else {
			return false;
		}
	}
    return true;
};

var HeroesContract = function() {
	LocalContractStorage.defineMapProperty(this, "Heroes");
	LocalContractStorage.defineMapProperty(this, "HeroKeys");
	LocalContractStorage.defineProperty(this, "HeroCount", null);
	
	LocalContractStorage.defineMapProperty(this, "TopN_HeroKeys");
	LocalContractStorage.defineProperty(this, "TopN_HeroCount", null);
	LocalContractStorage.defineProperty(this, "RankN_HeroIndex", null);
};

HeroesContract.prototype = {
	init: function(TopN_HeroCount) {
		this.HeroCount = 0;
		
		if (TopN_HeroCount) {
			TopN_HeroCount = parseInt(TopN_HeroCount);
			if (isNaN(TopN_HeroCount)) {
				TopN_HeroCount = 0;
			}
			this.TopN_HeroCount = TopN_HeroCount;
		}else {
			this.TopN_HeroCount = 150;
		}
		
		this.RankN_HeroIndex = 0;
	},
  
  welcomeHero: function(score, time) {
	  if (!isAllNaN(score) || !isAllNaN(time)) {
		  throw new Error("Parameter Error!");
	  }
	  score = parseInt(score);
	  time = parseInt(time);
	  
	  var hero = Blockchain.transaction.from;
	  var timestamp = Blockchain.transaction.timestamp;
	  var tmp_hero = {"score": score, "time": time};
	  
	  console.log("welcomeHero() -- 1: " + hero + "," + score + "," + time + "," + timestamp);
	  
	  var newHeroFlag = false;
	  var updateHeroFlag = true;
	  var hero_info = this.Heroes.get(hero);
	  if (!hero_info) {
		  newHeroFlag = true;
		  hero_info = {"hero": hero, "score": score, "time": time, "timestamp": timestamp};
	  }else {
		  if (SortAsc(tmp_hero, hero_info) > 0) {
			  hero_info["score"] = score;
			  hero_info["time"] = time;
			  hero_info["timestamp"] = timestamp;
		  }else {
			  updateHeroFlag = false;
		  }
	  }
	  
	  console.log("welcomeHero() -- 2: " + newHeroFlag + "," + updateHeroFlag + "," + hero_info["score"] + "," + hero_info["timestamp"]);
	  
	  if (!updateHeroFlag) {
		  return true;
	  }
	  
	  this.Heroes.set(hero, hero_info);
	  
	  if (newHeroFlag) {
		  var HeroCount = new BigNumber(this.HeroCount).plus(1);
		  this.HeroCount = HeroCount;
		  this.HeroKeys.set(HeroCount, hero);
	  }
		  
	  console.log("welcomeHero() -- 3: " + this.HeroCount + "," + this.TopN_HeroCount + "," + this.RankN_HeroIndex);
	  
	  if (this.HeroCount < this.TopN_HeroCount) {
		  this.TopN_HeroKeys.set(this.HeroCount, hero);
		  return true;
	  }
	  
	  if (this.RankN_HeroIndex === 0) {
		  this.TopN_HeroKeys.set(this.HeroCount, hero);
	  }else {
		  var RankN_HeroKey = this.TopN_HeroKeys.get(this.RankN_HeroIndex);
		  var RankN_HeroInfo = this.Heroes.get(RankN_HeroKey);
		  
		  if (SortAsc(tmp_hero, RankN_HeroInfo) <= 0 ) {
			  return true;
		  }
		  
		  this.TopN_HeroKeys.set(this.RankN_HeroIndex, hero);
	  }
	  
	  this.RankN_HeroIndex = this.getRankN();
	  
	  console.log("welcomeHero() -- 4: " + this.RankN_HeroIndex);
	  
	  return true;
  },
  
  getHero: function() {
	  var hero = Blockchain.transaction.from;
	  return this.Heroes.get(hero);
  },
  
  getTopN: function(count) {
	  if (!isAllNaN(count)) {
		  throw new Error("Parameter Error!");
	  }  
	  count = parseInt(count);
	  
	  console.log("getTopN() -- 1: " + count);
	  
	  var TopN_HeroCount = this.TopN_HeroCount;
	  if (this.HeroCount < TopN_HeroCount) {
		  TopN_HeroCount = this.HeroCount;
	  }
	  
	  console.log("getTopN() -- 2: " + TopN_HeroCount + "," + this.TopN_HeroCount + "," + this.HeroCount);

	  var hero_info_arr = [];
	  for (var idx = 1; idx <= TopN_HeroCount; idx++) {
		  var hero_key = this.TopN_HeroKeys.get(idx);
		  var hero_info = this.Heroes.get(hero_key);
		  hero_info_arr.push(hero_info);
		  console.log("getTopN() -- 3: " + idx + "," + hero_key + "," + hero_info["score"]);
	  }
	  
	  hero_info_arr.sort(SortDesc);
	  
	  if (count > TopN_HeroCount) {
		  count = TopN_HeroCount;
	  }
	  
	  console.log("getTopN() -- 4: " + count);
	  
	  var TopN_Heros = [];
	  for (var index = 0; index < count; index++) {
		  TopN_Heros.push(hero_info_arr[index]);
	  }
	  
	  return TopN_Heros;
  },
  
  getRankN: function() {
	  var RankN_HeroIndex = 1;
	  var RankN_HeroKey = this.TopN_HeroKeys.get(RankN_HeroIndex);
	  var RankN_HeroInfo = this.Heroes.get(RankN_HeroKey);
	  
	  console.log("getRankN() -- 1: " + RankN_HeroIndex + "," + RankN_HeroKey + "," + RankN_HeroInfo["score"]);
	  
	  for (var idx = 2; idx < this.TopN_HeroCount; idx++) {
		  RankN_HeroKey = this.TopN_HeroKeys.get(idx);
		  
		  var hero_info = this.Heroes.get(RankN_HeroKey);
		  console.log("getRankN() -- 2: " + idx + "," + RankN_HeroKey + "," + hero_info["score"]);
		  
		  if (SortAsc(hero_info, RankN_HeroInfo) < 0) {
			  RankN_HeroIndex = idx;
			  RankN_HeroKey = this.TopN_HeroKeys.get(RankN_HeroIndex);
			  RankN_HeroInfo = this.Heroes.get(RankN_HeroKey);
		  }
	  }
	  
	  console.log("getRankN() -- 3: " + RankN_HeroIndex + "," + RankN_HeroKey + "," + RankN_HeroInfo["score"]);
	  
	  return RankN_HeroIndex;
  },
};

module.exports = HeroesContract;