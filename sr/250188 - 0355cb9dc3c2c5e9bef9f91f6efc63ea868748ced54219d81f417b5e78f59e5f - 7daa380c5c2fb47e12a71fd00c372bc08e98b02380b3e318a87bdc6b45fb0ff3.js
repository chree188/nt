'use strict';

let Tweet = function (from, timeStamp, content) {
  this.from = from;
  this.timeStamp = timeStamp;
  this.content = content;
};

Tweet.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

let TweetContract = function () {
  LocalContractStorage.defineMapProperty(this, "tweets");
  LocalContractStorage.defineProperty(this, "size");
};

TweetContract.prototype = {
  init: function () {
    this.size = 0;
  },

  post: function (content) {
    let index = this.size;
    let tweet = new Tweet(Blockchain.transaction.from, Blockchain.transaction.timestamp, content);
    this.tweets.set(index, tweet);
    this.size += 1;
  },

  timeline: function (pageSize, offset) {
    pageSize = parseInt(pageSize);
    offset = parseInt(offset);

    if (offset > this.size) {
      throw new Error("offset is not valid");
    }

    let number = offset + pageSize;
    if (number > this.size) {
      number = this.size;
    }

    const result = [];
    for (let i = offset; i < number; i++) {
      result.push(this.tweets.get(i));
    }
    return JSON.stringify(result);
  }
};

module.exports = TweetContract;