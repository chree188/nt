"use strict";

class Poll {
    constructor(text) {
        let obj = text ? JSON.parse(text) : {};
        this.id = obj.id || 0;
        this.author = obj.author;
        this.date = obj.date;
        this.title = obj.title;
        this.option1 = obj.option1;
        this.option2 = obj.option2;
        this.image1 = obj.image1;
        this.image2 = obj.image2;
        this.votes1 = obj.votes1 || 0;
        this.votes2 = obj.votes2 || 0;
    }

    toString() {
        return JSON.stringify(this);
    }
}

class VersusContract {
    constructor() {
        LocalContractStorage.defineProperty(this, "count");
        LocalContractStorage.defineMapProperty(this, "userVoted");
        LocalContractStorage.defineMapProperty(this, "userPolls");
        LocalContractStorage.defineMapProperty(this, "polls", {
            parse: function (text) {
                return new Poll(text);
            },
            stringify: function (o) {
                return o.toString();
            }
        });
    }

    init() {
        this.count = new BigNumber(1);
    }

    total() {
        return new BigNumber(this.count).minus(1).toNumber();
    }

    create(pollJson) {
        let from = Blockchain.transaction.from;
        let index = this.count;

        let poll = new Poll(pollJson);
        poll.id = index;
        poll.date = Date.now();
        poll.author = from;

        this.polls.put(index, poll);

        let userPolls = this.userPolls.get(from) || [];
        userPolls.push(index);
        this.userPolls.put(from, userPolls);

        this.count = new BigNumber(index).plus(1);
    }

    get(limit, offset) {

        let arr = [];
        for (let i = offset; i < limit + offset; i++) {
            let poll = this.polls.get(i);
            if (poll) {
                arr.push(poll);
            }
        }

        return arr;
    }

    vote(pollId, option) {
        let from = Blockchain.transaction.from;
        let poll = this.polls.get(pollId);

        if (!poll) {
            throw new Error("Poll not found");
        }

        let userVoted = this.userVoted.get(from) || [];
        if (userVoted.includes(pollId)) {
            throw new Error("You have already voted in this poll");
        }

        userVoted.push(pollId);
        this.userVoted.put(from, userVoted);

        if (option == 1) {
            poll.votes1 = new BigNumber(poll.votes1).plus(1);
        }
        else {
            poll.votes2 = new BigNumber(poll.votes2).plus(1);
        }

        this.polls.put(pollId, poll);
    }
}

module.exports = VersusContract;