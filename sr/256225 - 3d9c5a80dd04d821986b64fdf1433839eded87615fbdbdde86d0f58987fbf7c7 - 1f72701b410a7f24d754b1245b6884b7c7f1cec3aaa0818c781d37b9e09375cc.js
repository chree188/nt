'use strict';

const CANDIDATES = [
  'michaelJordan', 
  'lebronJames',
  'shaquilleONeal',
  'timDuncan',
  'kobeBryant',
  'dwyaneWade'
];

var VotingEntry = function (text) {
  if (text) {
    var o = JSON.parse(text);
    this.name = o.name;
    this.vote = new Number(o.vote);
  } else {
    this.name = '';
    this.vote = 0;
  }
};

VotingEntry.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

var PlayerVotingContract = function () {
  LocalContractStorage.defineMapProperty(this, "playerVoting", {
    parse: function (text) {
      return new VotingEntry(text);
    },
    stringify: function (o) {
      return o.toString();
    }
  });
};

// save value to contract, only after height of block, users can takeout
PlayerVotingContract.prototype = {
  init: function () {
    //TODO:
  },
  save: function (name = "") {
    if (name === "" || !CANDIDATES.includes(name)){
      throw new Error("invalid name");
    }

    var from = Blockchain.transaction.from;

    var votingEntry = this.playerVoting.get(name);

    if (votingEntry) {
      votingEntry.vote = votingEntry.vote + new Number(1)
    } else {
      var votingEntry = new VotingEntry();
      votingEntry.name = name;
      votingEntry.vote = new Number(1);
    }

    this.playerVoting.put(name, votingEntry);
  },
  get: function (name) {
    name = name.trim();
    if ( name === "" ) {
      throw new Error("empty name")
    }
    return this.playerVoting.get(name);
  }

};
module.exports = PlayerVotingContract;