"use strict";

var VoteContract = function() {
  LocalContractStorage.defineMapProperty(this, "voter");
  LocalContractStorage.defineMapProperty(this, "id_voter");
  LocalContractStorage.defineProperty(this, "admin", null);
  LocalContractStorage.defineProperty(this, "v_cnt", null);
  LocalContractStorage.defineProperty(this, "voted_cnt", null);
};

VoteContract.prototype = {
  init: function() {
    this.v_cnt = 0;
	this.voted_cnt = 0;
	this.admin = Blockchain.transaction.from;
  },

  newVoter: function(voter) {
	var admin = Blockchain.transaction.from;
	if (admin !== this.admin){
		throw new Error("Not admin user");
	}
	if (!voter){
		throw new Error("No voter!");
	}
	var vote_info = this.voter.get(voter);
	if (vote_info){
		throw new Error("Not new user!");
	}
	
    var v_cnt = new BigNumber(this.v_cnt).plus(1);
    var vote_info = { "cnt": 0, "state": 0 };
    this.id_voter.set(this.v_cnt, voter);
    this.voter.set(voter, vote_info);
    this.v_cnt = v_cnt;

    return true;
  },

  
  newVoters: function(voters) {
	var admin = Blockchain.transaction.from;
	if (admin !== this.admin){
		throw new Error("Not admin user");
	}
	var voter_arr = voters.split(",");
	for(var idx in voter_arr)
	{
		console.log(idx + "---" + voter_arr[idx]);
		this.newVoter(voter_arr[idx]);
	}
	return true;
  },
  
  
  vote: function(to) {
	console.log("vote() --- 1: " + to);
	var vote_info = this.voter.get(Blockchain.transaction.from);
	if (!vote_info  || vote_info["state"]){
		throw new Error("Voted already");
	}
	
	console.log("vote() --- 2: " + vote_info);
	
	var dest_vote_info = this.voter.get(to);
	if(!dest_vote_info){
		throw new Error("Illegal wallet address");
	}
	
	console.log("vote() --- 3: " + dest_vote_info);
	
    vote_info["state"] = 1;
	vote_info["to"] = to;
    this.voter.set(Blockchain.transaction.from, vote_info);
	
	dest_vote_info["cnt"] += 1;
	this.voter.set(to, dest_vote_info);
	
	this.voted_cnt = new BigNumber(this.voted_cnt).plus(1);
    return true;
  },

  
  getVoter: function(voter) {
	return this.voter.get(voter);
  },
  
  
  getVoterById: function(id) {
	id = new BigNumber(id);
	var vote = this.id_voter.get(id);
	if (!vote){
		throw new Error("No such id");
	}
    return {"info":this.voter.get(vote), "v_cnt": this.v_cnt, "voter":vote};
  }, 
  
  
  getVoters: function(start, cnt) {
	start = new BigNumber(start);
	var end = new BigNumber(cnt) + start;
	if (end > this.v_cnt){
		end = this.v_cnt;
	}
	var voter_array = [];
	for (var i = start; i < end; i++){
		var voter = this.id_voter.get(i);
		var items = {};
		items[voter] = this.voter.get(voter);
		voter_array.push(items);
	}
    return {"data":voter_array, "v_cnt": this.v_cnt, "voted_cnt": this.voted_cnt};
  },
};

module.exports = VoteContract;