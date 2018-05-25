"use strict";

var Candidate = function(text) {
    this.name = text;
    this.number = new BigNumber(0);
};

var Vote = function(){
    this.name = "";
    this.sTime = "";
    this.eTime = "";
    this.author = "";
    // LocalContractStorage.defineMapProperty(this, "candidateMap");
};

var VoteContract = function () {
    LocalContractStorage.defineMapProperty(this, "voteMap");
};

VoteContract.prototype = {
    init: function() {

    },

    genKey: function() {
        var key = Math.random().toString(36).substr(2);
        var now = new Date();
        var year = now.getYear(); 
        var month = now.getMonth()+1; 
        var day = now.getDate(); 
        var hour = now.getHours(); 
        var minute = now.getMinutes(); 
        var second = now.getSeconds(); 
        
        key = year + month + day + hour + minute + second + key; 
        console.log("key =" + key);
        return key;
    },

    getAll: function() {
        return this.voteMap;
    },

    get: function(key) {
        key = key.trim();
        if(key == ""){
            throw new Error("empty key");
        }
        return this.voteMap.get(key);
    },

    save: function(name, sTime, eTime, candidates) {
        name = name.trim();
        sTime = sTime.trim();
        eTime = eTime.trim();
        candidates = candidates.trim();
        if (name == "" || sTime == "" || eTime == "" || candidates == "") {
            throw new Error(" empty value");
        }
        
        var from = Blockchain.transaction.from;
        var key = this.genKey();
        var vote = this.voteMap.get(key);
        while(vote) {
            key = this.genKey();
            vote = this.voteMap.get(key);
        }
        vote = new Vote();
        vote.name = name;
        vote.sTime = sTime;
        vote.eTime = eTime;
        vote.author = form;

        // var candidateArray = candidates.split(";");
        // for(i=0; i<candidateArray.length; i++){
        //     vote.candidateMap.put(new Candidate(candidateArray[i]));
        // }

        this.voteMap.put(key, vote);
    },

    update: function (key1, key2) { 
        key1 = key1.trim();
        key2 = key2.trim();
        if(key1 == "" || key2 == ""){
            throw new Error("empty key");
        } 
        var vote = this.voteMap.get(key1);
        if(!vote) {
            throw new Error("no such vote");
        }
        var now = new Date();
        var year = now.getYear(); 
        var month = now.getMonth()+1; 
        var day = now.getDate(); 
        var time = year + "-" + month + "-" + day;
        if (time < vote.sTime) {
            throw new Error("vote is pending");
        }
        if (time > vote.eTime) {
            throw new Error("vote has ended");
        }

        var candidate = vote.candidateMap.get(key2);
        if (!candidate) {
            throw new Error("no such candidate");
        }
        this.voteMap.get(key1).candidateMap.get(key2).number.puls(1);
    }
};

module.exports = VoteContract;