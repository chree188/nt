'use strict';

var VoteContent = function (text) {
  if (text) {
    var o = JSON.parse(text);
    this.choice = o.choice;
  } else {
    this.choice = -1;
  }
};
VoteContent.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

var VoteQuestionContent = function (text) {
  if (text) {
    var o = JSON.parse(text);
    this.choice1Count = o.choice1Count;
    this.choice2Count = o.choice2Count;
  } else {
    this.choice1Count = 0;
    this.choice2Count = 0;
  }
};
VoteQuestionContent.prototype = {
  toString: function () {
    return JSON.stringify(this);
  }
};

var VoteContract = function () {
  LocalContractStorage.defineMapProperty(this, "voteMap", {
    parse: function (text) {
      return new VoteContent(text);
    },
    stringify: function (o) {
      return o.toString();
    }
  });

  LocalContractStorage.defineMapProperty(this, "voteQuestionMap", {
    parse: function (text) {
      return new VoteQuestionContent(text);
    },
    stringify: function (o) {
      return o.toString();
    }
  });

  LocalContractStorage.defineProperties(this, {
    startBlockHeight: -1,
    endBlockHeight: -1
  });
};

var choices = [1, 2];
var voteQuestionID = 'testVoteQuestionID';

// save vote to contract, one user can only vote once
VoteContract.prototype = {
  init: function (start, end) {
    this.startBlockHeight = start;
    this.endBlockHeight = end;
  },
  vote: function (choice) {
    var from = Blockchain.transaction.from;
    var bk_height = new BigNumber(Blockchain.block.height);
    var originStart = new BigNumber(-1);
    var originEnd = new BigNumber(-1);

    if (originStart.eq(this.startBlockHeight) || originEnd.eq(this.endBlockHeight)) {
      throw new Error("vote has not set start end time");
    }
    if (bk_height.lt(this.startBlockHeight)) {
      throw new Error("vote has not start.");
    }
    if (bk_height.gt(this.endBlockHeight)) {
      throw new Error("vote is end.");
    }
    if (choices.indexOf(choice) < 0) {
      throw new Error("do not has this choice."); 
    }

    // 投票历史，已经投过票的不能再投票
    var historyVote = this.voteMap.get(from);
    if (historyVote) {
      throw new Error("has voted before.");
    }
    historyVote = new VoteContent();
    historyVote.choice = choice;
    this.voteMap.put(from, historyVote);

    // 更新题目投票统计
    var voteQuestion = this.voteQuestionMap.get(voteQuestionID);
    if (!voteQuestion) {
      voteQuestion = new VoteQuestionContent();
    }
    if (choice == 1) {
      voteQuestion.choice1Count += 1;
    } else {
      voteQuestion.choice2Count += 1;
    }
    this.voteQuestionMap.put(voteQuestionID, voteQuestion);
  },
  getMyVote: function () {
    var from = Blockchain.transaction.from;
    return this.voteMap.get(from);
  },
  get: function() {
    return this.voteQuestionMap.get(voteQuestionID);
  }
};
module.exports = VoteContract;