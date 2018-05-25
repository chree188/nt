"use strict";

var Treasury = function() {
    LocalContractStorage.defineMapProperty(this, "creator")
    LocalContractStorage.defineMapProperty(this, "voters")
    LocalContractStorage.defineProperty(this, "votersCount", null)
    LocalContractStorage.defineMapProperty(this, "votes")
    LocalContractStorage.defineProperty(this, "voteCount", null)
    LocalContractStorage.defineMapProperty(this, "proposals")
    LocalContractStorage.defineProperty(this, "proposalsCount", null)
    LocalContractStorage.defineMapProperty(this, "stats")
}

Treasury.prototype = {
    init: function() {
        // set creator address. creator can add more proposals 
        this.creator.set("address", Blockchain.transaction.from)
        this.voteCount = 0
        this.proposalsCount = 0
    },
    vote: function(proposalId, answer) {
        if (this.proposalsCount == 0) {
            return 'There are no proposals yet!'
        }
        if (answer != 0 && answer != 1) {
            return `Please answer 0  or 1 (0 means no, 1 means yes) !`
        }

        if (proposalId <= 0 || proposalId > this.proposalsCount) {
            return "This is not a valid proposal. Please wait for the blockchain to sync."
        }

        // only 1 vote per address per proposal
        var voter = this.voters.get([Blockchain.transaction.from])
        var firstTimeVoter = true
        if (voter != null) {
            firstTimeVoter = false
            if (voter.hasOwnProperty(proposalId)) {
                return "Sorry you can not modify your submitted vote."
            }
        }

        var voteCount = new BigNumber(this.voteCount).plus(1)

        var vote = {
            [proposalId]: answer
        }

        if (firstTimeVoter) {
            this.voters.set(Blockchain.transaction.from, vote)
        } else {
            var o1 = this.voters.get(Blockchain.transaction.from)
            var obj = Object.assign({}, o1, vote);
            this.voters.set(Blockchain.transaction.from, obj)
        }

        this.votes.set(voteCount, vote)
        this.voteCount = voteCount

        var humanAnswer = null
        var currentStats = this.stats.get(proposalId)
        if (answer == 1) {
            humanAnswer = "yes"
            currentStats.voteYes += 1
            this.stats.set(proposalId, currentStats)
        } else {
            humanAnswer = "no"
            currentStats.voteNo += 1
            this.stats.set(proposalId, currentStats)
        }

        return `You voted ${humanAnswer} to ${this.proposals.get([proposalId])} proposal (proposalId: ${proposalId})!`
    },
    setProposal: function(name, price, description) {
        var creator = this.creator.get("address");
        // No one else can add proposals
        // if (Blockchain.transaction.from != creator) {
        //     return "You are not the creator of this smart contract!"
        // } else {
            var proposalsCount = new BigNumber(this.proposalsCount).plus(1)

            this.proposals.set(proposalsCount, name)

            var addToStats = {
                "proposalId": proposalsCount,
                "name": name,
                "price": price,
                "description": description,
                "voteYes": 0,
                "voteNo": 0
            }

            this.stats.set(proposalsCount, addToStats)


            this.proposalsCount = proposalsCount
            return `${name} proposal (Proposal Id: ${proposalsCount}) was successfully created!`
        // }
    },
    getStats: function() {
        var array = []
        for (var i = 1; i <= this.proposalsCount; i++) {
            array.push(this.stats.get([i]))
        }
        return array
    },
    getCreator: function() {
        return this.creator.get("address")
    },
    getAddress: function() {
        return Blockchain.transaction.from
    },
    getProposalsCount: function() {
        return this.proposalsCount
    },
    getProposalById: function(proposalId) {
        if (!proposalId || proposalId.toString().trim() === "") proposalId = -1
        if (proposalId == -1) {
            var allProposalsString = ""
            for (var i = 1; i <= this.proposalsCount; i++) {
                if (i == this.proposalsCount) {
                    allProposalsString += this.proposals.get([i])
                } else {
                    allProposalsString += this.proposals.get([i]) + ", "
                }
            }
            return `Current proposals: ${allProposalsString}`
        } else if (proposalId <= 0 && proposalId > this.proposalsCount) {
            return "This is not a valid proposal!"
        } else {
            return this.proposals.get([proposalId])
        }
    },
    getVoteCount: function() {
        return this.voteCount
    },
    getUserVotes: function(address) {
        if (!address || address.toString().trim() === "") address = Blockchain.transaction.from
        if (address == null) {
            return `There are no proposals yet for address ${address}`
        } else {
            return this.voters.get([address])
        }
    }
    // help: function() {}
}

module.exports = Treasury;