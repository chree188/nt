'use strict';


var VoteContract = function () {
    LocalContractStorage.defineProperties(this, {
        isOpen: null,
        adminAddress: null,
        openvotes: null
    });
    LocalContractStorage.defineMapProperty(this, 'votes');
    LocalContractStorage.defineProperty(this, "currentVoteId");
};

VoteContract.prototype = {
    init: function () {
        this.isOpen = true;
        this.currentVoteId = 0;
        this.adminAddress = Blockchain.transaction.from;
        this.openvotes = [];

    },
    getAll: function () {
        var result = [];
        var item;
        for (var i = 1; i <= this.currentVoteId; i++) {
            item = this.votes.get(i);
            result.push(item)
        }
        return result
    },
    newVote: function (title, choice_a, choice_b) {

        var voteID = this.currentVoteId;
        this.currentVoteId = voteID + 1;
        var id = this.currentVoteId;
        var authorAddress = Blockchain.transaction.from;
        var endTime = Blockchain.block.timestamp + 60 * 60 * 24 * 7;
        this.votes.put(id, {
            authorAddress: authorAddress,
            id: id,
            title: title,
            choice_a: choice_a,
            choice_b: choice_b,
            choice_a_tickets: 0,
            choice_b_tickets: 0,
            voters: [],
            endTime: endTime
        });
        this.openvotes.push(id);
        return id;
    },
    Voting: function (id, choice) {
        var voter_address = Blockchain.transaction.from;
        var vote = this.votes.get(id);
        if (!vote) {
            throw new Error("vote empty");
        }
        if (Blockchain.block.timestamp >= this.votes.get(id).endTime) {
            throw new Error("vote is end");
        }
        for (var index in vote.voters) {
            if (voter_address == vote.voters[index]) {
                throw new Error("had voted");
            }
        }

        if (choice == "choice_a") {
            vote.choice_a_tickets += 1;
        } else if (choice == "choice_b") {
            vote.choice_b_tickets += 1;
        } else {
            throw new Error("error choice");
        }

        vote.voters.push(voter_address);

        this.votes.put(id, vote);
        return this.votes.get(id)

    }

};


module.exports = VoteContract;



