'use strict';

const Poll = function(text) {
  if (text) {
    const o = JSON.parse(text);
    this.question = o.question;
    this.isMultipleSelection = o.isMultipleSelection;
    this.options = o.options;
    this.isClosed = o.isClosed;
    this.creatorId = o.creatorId;
    this.createdAt = o.createdAt;
    this.votingDataId = o.votingDataId;
    this.index = o.index;
  } else {
    this.question = '';
    this.isMultipleSelection = false;
    this.options = [];
    this.isClosed = false;
    this.creatorId = '';
    this.createdAt = null;
    this.votingDataId = '';
    this.index = null;
  }
};

const NebulasPoll = function() {
  LocalContractStorage.defineMapProperty(this, 'poll', {
    parse: function(text) {
      return new Poll(text);
    },
  });
  LocalContractStorage.defineMapProperty(this, 'votingData');
  LocalContractStorage.defineMapProperty(this, 'creator');
  LocalContractStorage.defineProperty(this, 'counter', {
    parse: function(text) {
      return parseInt(text, 10);
    },
  });
};

NebulasPoll.prototype = {
  init: function() {
    this.counter = 0;
  },
  createPoll: function(question, isMultipleSelection, options) {
    const idx = this.counter + 1;
    const creatorId = Blockchain.transaction.from;
    const votingDataId = Blockchain.transaction.hash;

    if (options.length < 2) {
      throw new Error('A poll should at least has 2 options.');
    }

    let newPoll = new Poll();
    newPoll.question = question;
    newPoll.isMultipleSelection = isMultipleSelection;
    newPoll.options = options;
    newPoll.creatorId = creatorId;
    newPoll.createdAt = new Date();
    newPoll.votingDataId = votingDataId;
    newPoll.index = idx;

    this.poll.set(idx, newPoll);
    this.votingData.set(votingDataId, {});
    let creatorPolls = this.creator.get(creatorId);
    if (creatorPolls) {
      this.creator.set(creatorId, creatorPolls + ',' + idx);
    } else {
      this.creator.set(creatorId, idx);
    }
    this.counter = idx;

    return newPoll;
  },
  vote: function(idx, voteValue) {
    const poll = this.poll.get(idx);

    if (poll.isClosed === true) {
      throw new Error('This poll has been closed.');
    }
    if (!poll.isMultipleSelection && voteValue.length > 1) {
      throw new Error('Invalid vote.');
    }
    if (poll.isMultipleSelection && voteValue.some(i => i >= poll.options.length)) {
      throw new Error('Invalid vote.');
    }

    const creatorId = Blockchain.transaction.from;
    const votingDataId = poll.votingDataId;
    let votingData = Object.assign(this.votingData.get(votingDataId), {});

    if (votingData.hasOwnProperty(creatorId)) {
      throw new Error('You have already voted this poll.');
    }

    votingData[creatorId] = {
      voteValue,
      txhash: Blockchain.transaction.hash,
    };
    this.votingData.set(votingDataId, votingData);

    return votingData;
  },
  closePoll: function(idx) {
    const poll = Object.assign(this.poll.get(idx), {});

    if (poll.creatorId !== Blockchain.transaction.from) {
      throw new Error('Only the creator can close this poll.');
    }

    poll.isClosed = true;
    this.poll.set(idx, poll);

    return poll;
  },
  queryPoll: function(idx) {
    const poll = Object.assign(this.poll.get(idx), {});
    poll.votingData = this.votingData.get(poll.votingDataId);
    return poll;
  },
  queryPollsByCreatorId: function(creatorId) {
    let creatorPolls = this.creator.get(creatorId);
    if (creatorPolls == null) return [];

    const creatorPollsList = creatorPolls.split(',');
    let pollsList = [];
    for (let i = 0; i < creatorPollsList.length; i++) {
      pollsList.push(this.poll.get(creatorPollsList[i]));
    }

    return pollsList;
  },
  queryPolls: function(currentPage = 1) {
    const pollsPerPage = 20;
    let pageCount = 1;
    if (this.counter > pollsPerPage) {
      pageCount =
        this.counter % pollsPerPage === 0
          ? parseInt(this.counter / pollsPerPage, 10)
          : parseInt(this.counter / pollsPerPage, 10) + 1;
    }

    if (currentPage > pageCount) {
      throw new Error('The querying page does not exist.');
    }

    const startIdx = this.counter - (currentPage - 1) * pollsPerPage;
    const endIdx = Math.max(0, startIdx - pollsPerPage);
    let pollsList = [];
    for (let i = startIdx; i > endIdx; i--) {
      pollsList.push(this.poll.get(i));
    }

    return {
      pageCount,
      currentPage,
      pollsList,
    };
  },
};

module.exports = NebulasPoll;