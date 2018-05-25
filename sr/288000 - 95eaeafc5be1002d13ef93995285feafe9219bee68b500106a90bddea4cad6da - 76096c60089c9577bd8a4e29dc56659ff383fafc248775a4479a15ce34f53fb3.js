"use strict";

var Candidate = function() {
    this.name = "";
    this.number = 0;
}

var Vote = function(text){
    this.name = "";
    this.sTime = "";
    this.eTime = "";
    this.author = "";
    this.candidateNumber = new BigNumber(0);
};


var VoteContract = function () {
    LocalContractStorage.defineMapProperty(this, "voteMap");
    LocalContractStorage.defineMapProperty(this, "candidateMap");
    LocalContractStorage.defineProperty(this, "voteSize");
    LocalContractStorage.defineProperty(this, "candidateSize");
};

VoteContract.prototype = {
    init: function() {
        this.voteSize = 0;
        this.candidateSize = 0;
    },

    get: function(a) {

        return this.candidateMap.get(a);

    },


    save: function(a) {
            var candidate = new Candidate();
            candidate.name = a;
            this.candidateMap.set(a, candidate);
            this.candidateSize += 1;
        
    },

    update: function (a) { 
        
        var candidate = this.candidateMap.get(a);
        if (!candidate) {
            throw new Error("no such candidate");
        }
        candidate.number += 1;
        this.candidateMap.set(a, candidate);
    }
};

module.exports = VoteContract;