"use strict";

var AddressPopularityLedger = function () {
    LocalContractStorage.defineMapProperty(this, "votes_array");
    LocalContractStorage.defineMapProperty(this, "votes");
    LocalContractStorage.defineProperty(this, "size");

    LocalContractStorage.defineProperty(this, "candidates");
};

AddressPopularityLedger.prototype = {
    init: function () {
        this.candidates = Array();
        this.size = 0;
    },

    add_candidate: function (address) {
        var candidates_copy = this.candidates;

        candidates_copy.forEach(function(candidate) {
            if (address == candidate) {
                throw new Error("Candidate already exists");
            }
        });

        candidates_copy.push(address);
        this.candidates = candidates_copy;
    },

    get_candidates: function () {
        return this.candidates.toString();
    },

    vote: function (candidate) {
        var candidates_copy = this.candidates;
        var candidate_exists = false;

        candidates_copy.forEach(function(address) {
            if (address == candidate) {
                candidate_exists = true;
            }
        });

        if (candidate_exists == false) {
            throw new Error("Candidate does not exists");
        }

        var voter_id = Blockchain.transaction.from;
        var index = this.size;
        var limit = this.size;

        for (var i = 0; i < limit; i++) {
            var key = this.votes_array.get(i);
            var object = this.votes.get(key);

            if (key == voter_id) {
                index = key;
                break;
            }
        }

        this.votes_array.set(index, voter_id);
        this.votes.set(voter_id, candidate);
        this.size +=1;
    },

    get_votes: function (candidate) {
        var candidates_copy = this.candidates;
        var candidate_exists = false;

        candidates_copy.forEach(function(address) {
            if (address == candidate) {
                candidate_exists = true;
            }
        });

        if (candidate_exists == false) {
            throw new Error("Candidate does not exists");
        }

        var total_votes = 0;
        var limit = this.size;

        for (var i = 0; i < limit; i++) {
            var key = this.votes_array.get(i);
            var object = this.votes.get(key);

            if (object == candidate) {
                total_votes += 1;
            }
        }

        return total_votes;
    }
};

module.exports = AddressPopularityLedger;
