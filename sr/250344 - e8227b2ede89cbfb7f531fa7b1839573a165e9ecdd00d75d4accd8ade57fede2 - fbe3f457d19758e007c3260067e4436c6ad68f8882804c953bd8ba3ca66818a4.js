"use strict";

var PollResult = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.account = obj.account;
		this.answer = obj.answer;
		this.date = obj.date;
	} else {
	    this.account = "";
		this.answer = "";
		this.date = "";
	}
};

var PollItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.key = obj.key;
		this.account = obj.account;
		this.title = obj.title;
		this.options = obj.options;
		this.totalResponses = obj.totalResponses;
	} else {
		this.key = "";
		this.account = "";
		this.title = "";
		this.options = "";
		this.totalResponses = 0;
	}
}

PollResult.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

PollItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
}

var CryptoPoll = function () {
    LocalContractStorage.defineMapProperty(this, "polls");
	
	LocalContractStorage.defineMapProperty(this, "results");
};

CryptoPoll.prototype = {
    init: function () {
        
    },
	createPoll: function(key, data) {
		if (key === "") {
            throw new Error("empty key");
        }

        var from = Blockchain.transaction.from;
		
		var poll = this.polls.get(key);
		if (poll) {
			throw new Error("key has been occupied");
		}
		var obj = JSON.parse(data);
		
		poll = new PollItem();
		poll.key = key;
		poll.account = from;
		poll.title = obj.title;
		poll.options = obj.options;
		poll.totalResponses = 0;
		
		this.polls.put(key, poll);
		console.log("poll created/updated");
	},
    saveResponse: function (key, answer) {
        if (key === ""){
            throw new Error("empty key");
        }

        var from = Blockchain.transaction.from;
		
		var poll = this.polls.get(key);
		if (!poll) {
			throw new Error('poll has not been created');
		}
		
		var totalResponses = poll.totalResponses;
		
		var obj = JSON.parse(data);
		
		var response = new PollResult();
		totalResponses++;
		var responseKey = this._generatePollResultKey(key, totalResponses);
		
		response.account = from;
        response.answer = answer;
		response.date = new Date();
		this.results.put(responseKey, response);
		console.log("response created/updated");
		
		poll.totalResponses = totalResponses;
		this.polls.put(key, poll);
		console.log("poll created/updated");
    },
    get: function (key) {
        if (key === "") {
            throw new Error("empty key")
        }
		
		var result = {
			key: key,
			message: "",
			poll: {},
			data: []
		};
		var poll = this.polls.get(key);
		if (!poll) {
			result.message = "poll not found!";
			return result;
		}
		
		result.poll = poll;
		
		var totalResponses = poll.totalResponses;
		for (var i = 0; i < totalResponses; i++) {
			var responseKey = this._generatePollResultKey(key, i + 1);
			var obj = this.results.get(responseKey);
			
			if (obj) {
				if (obj.answer == "") {
					continue;
				}
				
				result.data.push({
					index: i + 1,
					answer: obj.answer,
					date: obj.date
				});
			}
		}
		
        return result;
    },
	_generatePollResultKey: function(key, index) {
		return key + "" + index;
	}
};

module.exports = CryptoPoll;