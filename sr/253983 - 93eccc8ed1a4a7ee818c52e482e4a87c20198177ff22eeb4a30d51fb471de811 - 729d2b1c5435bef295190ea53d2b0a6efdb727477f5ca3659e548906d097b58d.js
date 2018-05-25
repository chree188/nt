'use strict';

var LoveWordsWallContract = function () {
  LocalContractStorage.defineMapProperty(this, "repo", null)
};

LoveWordsWallContract.prototype = {
  init: function () {
    this.repo.set('records', []);
  },
  add: function (name, words) {
    if (!name || !words) {
      throw new Error('require params');
    }
    if (name.length > 20 || words.length > 1000) {
      throw new Error('Length Limitation: name<20, words<1000');
    }
    var records = this.repo.get('records');
    if (records.length >= 10) {
      records.pop();
    }
    var record = {
      name, words, address: Blockchain.transaction.from, createon: Date.now()
    };
    records.unshift(record);
    this.repo.set('records', records);
  },
  getRecords: function () {
    return this.repo.get('records');
  },
};

module.exports = LoveWordsWallContract;
