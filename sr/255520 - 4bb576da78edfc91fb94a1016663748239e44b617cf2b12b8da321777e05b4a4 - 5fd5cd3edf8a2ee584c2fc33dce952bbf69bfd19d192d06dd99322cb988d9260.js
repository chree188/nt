"use strict";

//Poll options object
var PollOption = function(jsonOptions) {    
    if (jsonOptions) {
        this.options = [];
        var tempObj = JSON.parse(jsonOptions);
        
        for (var i = 0; i < tempObj.options.length; i++) {
            var option = tempObj.options[i];
            this.options.push({ 
                "key" : option.key, //option key
                "val"  : option.val, //option value
                "votes"  : option.votes //option total number of votes
            });
        }
        
        
    } else {
        this.options = [];
    }
};


//Poll item object
var PollItem = function(jsonPoll) {
    if (jsonPoll) {
        var tempObj = JSON.parse(jsonPoll);
        
        this.key = tempObj.key; //poll key
        this.question = tempObj.question; //poll question
        this.description = tempObj.description; //poll short description
        this.author_address = tempObj.author_address; //poll insertion address
        this.end_date = tempObj.end_date; //when will the poll voting end
        this.end_votes = tempObj.end_votes; //how many votes are allowed on this poll
        
        
    } else {
        this.key = "";
        this.question = "";
        this.description = "";
        this.author_address = "";
        this.end_date = "";
        this.end_votes = "";
        
    }
};

PollItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

PollOption.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};


var PollContract = function () {
    // The poll queue size
    LocalContractStorage.defineProperty(this, "size"); 
    
    //The poll index array
    LocalContractStorage.defineMapProperty(this, "arrayPollMap"); 
    
    //The poll values
    //The poll voters, having the key the poll key and the value the addresses that voted
    LocalContractStorage.defineMapProperty(this, "voters");
    
    //Poll storage
    LocalContractStorage.defineMapProperty(this, "pollMap", {
        parse: function (text) {
            return new PollItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    
    //Poll options storage
    LocalContractStorage.defineMapProperty(this, "optionsMap", {
        parse: function (text) {
            return new PollOption(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};


PollContract.prototype = {
    //Calling a private method
    //_isJsonString: function () {} 
    //this._isJsonString
    init: function () {
        this.size = 0;
        
        //Set a genesis poll question
        var options = [];
        options.push({ 
            "key" : "1",
            "val"  : "Yes",
            "votes"  : 0
        });
        
        options.push({ 
            "key" : "2",
            "val"  : "No",
            "votes"  : 0
        });
        
        
        this.savePoll(
            "genesis", 
            "Will bitcoin pass ATH of 20000 USD by the end of 2018?", 
            "First poll item, initialized on contract deployment", 
            "2018-12-31", 
            1000,
            JSON.stringify({'options' : options})
        );  
    },
    
    len:function(){
      return this.size;
    },
    
    //Return all polls and options
    getAll: function(){
        var resPolls = [];
        var resOptions = [];
        
        for(var i=0; i < this.size; i++){
            var key = this.arrayPollMap.get(i);
            var tempPoll = this.pollMap.get(key);
            var tempOptions = this.optionsMap.get(key);
            resOptions.push(tempOptions);
            resPolls.push(tempPoll);
        }
        
        var res = {
            polls:  resPolls,
            options:    resOptions
        };
        return JSON.stringify(res);
    },
    
    //["test", "Question test?", "description", "2018-08-03", "500", "{\"options\":[{\"key\":\"1\",\"val\":\"Yes\",\"votes\":0,\"altceva\":\"altceva\"},{\"key\":\"2\",\"val\":\"No\",\"votes\":0,\"ceva\":\"ceva\"}]}"]
    savePoll: function (key, question, description, end_date, end_votes, options) {

        var index = this.size;
        
        var from = Blockchain.transaction.from;
        
        var pollItem = new PollItem();
        
        pollItem.key = key;
        pollItem.question = question;
        pollItem.description = description;
        pollItem.author_address = from;
        pollItem.end_date = end_date;
        pollItem.end_votes = end_votes;
        
        var pollOptions = new PollOption(options);
                
        this.arrayPollMap.put(index, key);
        this.pollMap.put(key, pollItem);
        this.optionsMap.put(key, pollOptions);
        
        this.size += 1;
        
        return "Poll has been added";
    },
    
    vote: function (pollKey, optionKey) {
        var poll = this.pollMap.get(pollKey);
        var options = this.optionsMap.get(pollKey);
        
        var pollDate = new Date(poll.end_date);
        pollDate = pollDate.toISOString();
        var today = new Date();
        today = today.toISOString();
        
        //Check if poll has expired
        if(today > pollDate) {
            return "Poll voting period has ended on . " + pollDate;
        }
        
        var numberOfVotes = 0;
        
        //Count the total number of votes for the given poll
        for (var i = 0; i < options.options.length; i++) {
            var option = options.options[i];
            numberOfVotes += option.votes;
        }
        
        //Check if the total number of votes has been exceeded
        if(numberOfVotes >= poll.end_votes) {
            return "The maximum number of votes has been depleted";
        }
        
        var voted = false;
        
        //Check if the current address has voted before
        if(this._hasVoted(pollKey)) {
            return "You are not allowed to vote twice";
        }
        
        //Increment the vote for the given optionKey
        for (var i = 0; i < options.options.length; i++) {
            var option = options.options[i];
            if(option.key == optionKey) {
                option.votes += 1;
                voted = true;
                
                //Update the option object
                options.options[i] = option;
            }
        }
        
        if(voted) {
            //Update the voters
            this._saveVoteAddress(pollKey);
            
            //Update the options object
            this.optionsMap.put(pollKey, options);
            return "The vote has been cast";
        }
        
    },
    
    //Save the vote history so that you can't vote twice
    _saveVoteAddress: function(pollKey) {
        var voterAddress = Blockchain.transaction.from;
        if(!this._hasVoted(pollKey)) {
            var voters = JSON.parse(this.voters.get(pollKey));
            voters.push(voterAddress);
            this.voters.put(pollKey, JSON.stringify(voters));
        }
    },
    
    //Check if the current wallet has voted before on the current pollKey
    _hasVoted: function(pollKey) {
        var voterAddress = Blockchain.transaction.from;
        var voters = JSON.parse(this.voters.get(pollKey));
        
        if(voters == null) {
            this.voters.put(pollKey, JSON.stringify([]));
            return false;
        }
        for (var i = 0; i < voters.length; i++) {
            if (voters[i] == voterAddress) {
                return true;
            }
        }
        
        return false;
        
    },
    
    debug: function() {
        return this.voters.get("genesis");
    },
    
    debug1: function() {
        return this._hasVoted("genesis");
    }
    
};

module.exports = PollContract;