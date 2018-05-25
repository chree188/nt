"use strict";
var Treasury = function() {
    LocalContractStorage.defineMapProperty(this, "creator");
    LocalContractStorage.defineMapProperty(this, "voters");
    LocalContractStorage.defineProperty(this, "votersCount", null);
    LocalContractStorage.defineMapProperty(this, "votes");
    LocalContractStorage.defineProperty(this, "voteCount", null);
    LocalContractStorage.defineMapProperty(this, "proposals");
    LocalContractStorage.defineProperty(this, "proposalsCount", null);
    LocalContractStorage.defineMapProperty(this, "stats");
}

Treasury.prototype = {
    init: function() {
        this.creator.set("address", Blockchain.transaction.from);
        this.voteCount = 0;
        this.proposalsCount = 0;
    },
    _checkEmpty: function(field) {
        if (field !== 0 && (!field || field === "")) {
            throw new Error("Empty field. Please fill in all fields before submitting.");
        }
        return true;
    },
    vote: function(proposalId, answer) {
        if (proposalId) {
            if (typeof proposalId == "string") {
                proposalId = proposalId.trim();
            } else if (typeof proposalId == "number") {
                proposalId = parseInt(proposalId);
            } else {
                throw new Error("ProposalId is not in a valid format.");
            }
        }

        if (isNaN(proposalId)) {
            throw new Error('ProposalId is not a valid number.');
        }

        if (answer) {
            if (typeof answer == "string") {
                answer = answer.trim();
            } else if (typeof answer == "number") {
                answer = parseInt(answer);
            } else {
                throw new Error("Answer is not in a valid format.");
            }
        }

        if (isNaN(answer)) {
            throw new Error('Answer is not a valid number.');
        }

        this._checkEmpty(proposalId);
        this._checkEmpty(answer);

        if (this.proposalsCount == 0) {
            throw new Error('There are no proposals yet!');
        }

        if (answer != 0 && answer != 1) {
            throw new Error(`Please answer 0 or 1 (0 means no, 1 means yes).`);
        }

        if (proposalId <= 0 || proposalId > this.proposalsCount) {
            throw new Error("This is not a valid proposal (yet). Please wait for the blockchain to sync.");
        }

        // only 1 vote per address per proposal
        var voter = this.voters.get([Blockchain.transaction.from]);
        var firstTimeVoter = true;
        if (voter != null) {
            firstTimeVoter = false;
            if (voter.hasOwnProperty(proposalId)) {
                throw new Error("Sorry you can not modify your submitted vote.");
            }
        }

        var voteCount = new BigNumber(this.voteCount).plus(1);

        var vote = {
            [proposalId]: answer
        };

        if (firstTimeVoter) {
            // If haven't voted before, set their address as a property.
            this.voters.set(Blockchain.transaction.from, vote);
        } else {
            // If voted before, add new proposal and vote. Note: cannot modify existing votes.
            var o1 = this.voters.get(Blockchain.transaction.from);
            var obj = Object.assign({}, o1, vote);
            this.voters.set(Blockchain.transaction.from, obj);
        }

        // Update vote count
        this.votes.set(voteCount, vote);
        this.voteCount = voteCount;

        var humanAnswer = null;
        var bigNumberVote = null;
        // grab currentStats and update with new vote 
        var currentStats = this.stats.get(proposalId);
        if (answer == 1) {
            humanAnswer = "yes";
            bigNumberVote = new BigNumber(currentStats.voteYes);
            currentStats.voteYes = bigNumberVote.plus(1);
            this.stats.set(proposalId, currentStats);
        } else {
            humanAnswer = "no";
            bigNumberVote = new BigNumber(currentStats.voteNo);
            currentStats.voteNo = bigNumberVote.plus(1);
            this.stats.set(proposalId, currentStats);
        }
        // Vote successfully went through
        return `You voted ${humanAnswer} to ${this.proposals.get([proposalId])} proposal (proposalId: ${proposalId})!`;
    },
    setProposal: function(name, price, description) {
        if (name) {
            if (typeof name == "string") {
                name = name.trim();
            } else {
                throw new Error("Name is not in a valid format. Must be a string.");
            }
        }

        if (price) {
            if (typeof price == "string") {
                price = price.trim();
            } else if (typeof price == "number") {
                // Float because price can contain decimals
                price = parseFloat(price);
            } else {
                throw new Error("Price is not in a valid format.");
            }
        }

        if (isNaN(price)) {
            throw new Error('Price is not a valid number.');
        }

        if (description) {
            if (typeof description == "string") {
                description = description.trim();
            } else {
                throw new Error("Description is not in a valid format. Must be a string.");
            }
        }

        this._checkEmpty(name);
        this._checkEmpty(price);
        this._checkEmpty(description);

        var proposalsCount = new BigNumber(this.proposalsCount).plus(1);

        // Set proposalsCount
        this.proposals.set(proposalsCount, name);

        var addToStats = {
            "proposalId": proposalsCount,
            "name": name,
            "price": price,
            "description": description,
            "voteYes": 0,
            "voteNo": 0
        };
        // Update stats
        this.stats.set(proposalsCount, addToStats);
        // Update proposalsCount
        this.proposalsCount = proposalsCount;
        return `${name} proposal (Proposal Id: ${proposalsCount}) was successfully created!`;
    },
    getStats: function() {
        var array = [];
        for (var i = 1; i <= this.proposalsCount; i++) {
            array.push(this.stats.get([i]));
        }
        return array;
    },
    getCreator: function() {
        return this.creator.get("address");
    },
    getAddress: function() {
        return Blockchain.transaction.from;
    },
    getProposalsCount: function() {
        return this.proposalsCount;
    },
    getProposalById: function(proposalId) {
        if (proposalId) {
            if (typeof proposalId == "string") {
                proposalId = proposalId.trim();
            } else if (typeof proposalId == "number") {
                proposalId = parseInt(proposalId);
            } else {
                throw new Error("ProposalId is not in a valid format.");
            }
        }
        this._checkEmpty(proposalId);
        // grab all proposals if params is empty
        if (!proposalId || proposalId.toString().trim() === "") proposalId = -1;
        // -1: grab all proposals
        if (proposalId == -1) {
            var allProposalsString = "";
            for (var i = 1; i <= this.proposalsCount; i++) {
                if (i == this.proposalsCount) {
                    allProposalsString += this.proposals.get([i]);
                } else {
                    allProposalsString += this.proposals.get([i]) + ", ";
                }
            }
            return `Current proposals: ${allProposalsString}`;
        } else if (proposalId <= 0 && proposalId > this.proposalsCount) {
            throw new Error("This is not a valid proposal!");
        } else {
            return this.proposals.get([proposalId]);
        }
    },
    getVoteCount: function() {
        return this.voteCount;
    },
    getUserVotes: function(address) {
        if (address) {
            if (typeof address == "string") {
                address = address.trim();
            } else {
                throw new Error("Address is not in a valid format. Must be a string.");
            }
        }
        this._checkEmpty(address);
        // get own votes if params is empty
        if (!address || address.toString().trim() === "") address = Blockchain.transaction.from;
        if (address == null) {
            return new Error(`There are no proposals yet for address ${address}`);
        } else {
            return this.voters.get([address]);
        }
    }
}

module.exports = Treasury;