"use strict";

var VoteForOntarioElectionContract = function() {
  // Data stored by the smart contract
  LocalContractStorage.defineMapProperty(this, 'addr_to_candidate');
  LocalContractStorage.defineMapProperty(this, 'candidate_count');
  LocalContractStorage.defineProperty(this, 'candidates');
}

VoteForOntarioElectionContract.prototype = {
  // init is called once, when the contract is deployed.
  init: function(candidates) {
    var self = this;
    if (!candidates) throw new Error(JSON.stringify(candidates) + ' is not valid');
    self.candidates = candidates.split(',');
    self.candidates.forEach(function (c) {
      self.candidate_count.put(c, 0);
    });
  },

  castVote: function (candidate) {
    var self = this;

    if (self.candidates.indexOf(candidate) === -1) {
      throw new Error(candidate + ' is not running for office!');
    }

    var oldCandidate = self.addr_to_candidate.get(Blockchain.transaction.from);
    if (oldCandidate) {
      self.candidate_count.put(oldCandidate, self.candidate_count.get(oldCandidate) - 1);
    }
    self.candidate_count.put(candidate, self.candidate_count.get(candidate) + 1);
    self.addr_to_candidate.put(Blockchain.transaction.from, candidate);
  },

  getMyVote: function () {
    return this.addr_to_candidate.get(Blockchain.transaction.from);
  },

  getVotes: function () {
    var self = this;
    var candidateMapping = {};
    self.candidates.forEach(function (c) {
      candidateMapping[c] = self.candidate_count.get(c);
    });
    return candidateMapping;
  }
}

module.exports = VoteForOntarioElectionContract
