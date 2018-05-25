"use strict";

class Poll {
    constructor(str) {
        var data = str ? JSON.parse(str) : {};
        this.id = data.id || 0;
        this.title = data.title || "";
        this.wallet = data.wallet || "";
        this.selectedItemId = data.selectedItemId || "";
        this.created = data.created || "";
    }

    toString() {
        return JSON.stringify(this);
    }
}

class Item {
    constructor(str) {
        var data = str ? JSON.parse(str) : {};
        this.id = data.id || 0;
        this.text = data.text || "";
        this.voteCount = data.voteCount || 0;
    }

    toString() {
        return JSON.stringify(this);
    }
}

class SmartContract {
    constructor() {
        LocalContractStorage.defineProperty(this, "pollCounter");
        LocalContractStorage.defineProperty(this, "itemCounter");

        LocalContractStorage.defineMapProperty(this, "userVotes");
        LocalContractStorage.defineMapProperty(this, "pollItemIds");
        LocalContractStorage.defineMapProperty(this, "userPollIds");
        LocalContractStorage.defineMapProperty(this, "selectedPollIds");

        LocalContractStorage.defineMapProperty(this, "polls", {
            parse: (str) => new Poll(str),
            stringify: (o) => o.toString()
        });
        LocalContractStorage.defineMapProperty(this, "items", {
            parse: (str) => new Item(str),
            stringify: (o) => o.toString()
        });
    }

    init() {
        this.pollCounter = 0;
        this.itemCounter = 0;
    }

    getPollById(id) {
        let wallet = Blockchain.transaction.from;
        let poll = this.polls.get(id);

        if (poll) {
            poll.items = this._getItems(id);
            let userVotes = this.userVotes.get(wallet) || [];
            for (let vote of userVotes) {
                if (vote.pollId == id) {
                    poll.selectedItemId = vote.itemId;
                }
            }
        }
        return poll;
    }

    getPollsByWallet(wallet) {
        let userPollIds = this.userPollIds.get(wallet) || [];
        let polls = [];

        for (let pollId of userPollIds) {
            let poll = this.getPollById(pollId);
            if (poll) {
                polls.push(poll);
            }
        }
        return polls;
    }

    getMyPolls() {
        let wallet = Blockchain.transaction.from;
        return this.getPollsByWallet(wallet);
    }

    getPolls() {
        let polls = [];

        for (let i = 0; i < this.pollCounter; i++) {
            let poll = this.getPollById(i);
            if (poll) {
                polls.push(poll);
            }
        }
        return polls;
    }

    _getItems(pollId) {
        let itemIds = this.pollItemIds.get(pollId) || [];
        let items = [];
        for (let itemId of itemIds) {
            let item = this.items.get(itemId);
            if (item) {
                items.push(item);
            }
        }
        return items;
    }

    addPoll(title, itemsJson) {
        let wallet = Blockchain.transaction.from;

        let poll = new Poll();
        poll.id = this.pollCounter;
        poll.title = title;
        poll.wallet = wallet;
        poll.created = new Date();

        let items = JSON.parse(itemsJson);
        let itemIds = [];

        for (let itemText of items) {
            let item = new Item();
            item.id = this.itemCounter;
            item.text = itemText;
            itemIds.push(item.id);
            this.items.put(item.id, item);
            this.itemCounter++;
        }

        this.polls.put(poll.id, poll);
        this.pollItemIds.put(poll.id, itemIds);

        let userPollIds = this.userPollIds.get(wallet) || [];
        userPollIds.push(poll.id);
        this.userPollIds.put(wallet, userPollIds);

        this.pollCounter++;
        return poll.id;
    }

    vote(pollId, itemId) {
        let wallet = Blockchain.transaction.from;
        let item = this.items.get(itemId);

        let userVotes = this.userVotes.get(wallet) || [];

        for (let userVote of userVotes) {
            if (userVote.pollId == pollId) {
                if (userVote.itemId != itemId) {
                    let curItem = this.items.get(userVote.itemId);
                    if (curItem.voteCount > 0) {
                        curItem.voteCount--;
                        this.items.set(userVote.itemId, curItem);
                    }
                }
                userVote.itemId = itemId;
                break;
            }
        }

        item.voteCount++;
        let vote = { pollId: pollId, itemId: itemId };
        userVotes.push(vote);

        this.items.set(itemId, item);
        this.userVotes.set(wallet, userVotes);
    }
}

module.exports = SmartContract;