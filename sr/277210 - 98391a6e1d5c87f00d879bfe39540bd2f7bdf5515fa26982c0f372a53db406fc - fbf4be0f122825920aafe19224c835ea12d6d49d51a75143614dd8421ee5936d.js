var voter = function() {
    LocalContractStorage.defineMapProperty(this, "voters");
    LocalContractStorage.defineMapProperty(this, "votes");
    LocalContractStorage.defineMapProperty(this, "polls");
    LocalContractStorage.defineMapProperty(this, "pollChoices");
    LocalContractStorage.defineMapProperty(this, "pollSeq");


}

voter.prototype = {
    init: function() {
        this.pollSeq.put("seq", "1000000001");
    },


    placeVote: function(poll, choice) {
        var from = Blockchain.transaction.from;

        var voterID = "" + poll + from;

        var voterExists = this.voters.get(voterID);
        if (voterExists) {
            throw new Error("You may only vote one time.");
        }

        this.voters.put(voterID, "test");

        voteKey = "" + poll + choice;

        current = this.votes.get(voteKey);
        current = JSON.parse(current);
        newCount = current + 1;

        this.votes.del(voteKey);
        this.votes.put(voteKey, newCount);


    },

    getVotes: function(pollID) {
        var p1 = "" + pollID + 1;
        var o1 = this.votes.get(p1);

        var p2 = "" + pollID + 2;
        var o2 = this.votes.get(p2);

        var p3 = "" + pollID + 3;
        var o3 = this.votes.get(p3);

        var p4 = "" + pollID + 4;
        var o4 = this.votes.get(p4);


        var outStr = o1 + "::" + o2 + "::" + o3 + "::" + o4;
        return outStr;
    },

    getPoll: function(pollID) {
        var p1 = this.polls.get(pollID);
        return p1;
    },

    getPollID: function() {
        var pollSeq = this.pollSeq.get("seq");
        var pollID = Number(pollSeq) + 1;
        return pollID;
    },

    getOptions: function(pollID) {
        var key = "" + pollID + 1;
        var p1 = this.pollChoices.get(key);

        var key2 = "" + pollID + 2;
        var p2 = this.pollChoices.get(key2);

        var key3 = "" + pollID + 3;
        var p3 = this.pollChoices.get(key3);

        var key4 = "" + pollID + 4;
        var p4 = this.pollChoices.get(key4);

        var outStr = p1 + "::" + p2 + "::" + p3 + "::" + p4;
        return outStr;
    },

    newPoll: function(string, opt1, opt2, opt3, opt4) {
        var from = Blockchain.transaction.from;

        var pollSeq = this.pollSeq.get("seq");
        var pollID = Number(pollSeq) + 1;

        this.pollSeq.del("seq");
        this.pollSeq.put("seq", pollID);


        this.polls.put(pollID, string);

        choiceKey1 = "" + pollID + 1;
        this.pollChoices.put(choiceKey1, opt1);
        this.votes.put(choiceKey1, "0");

        choiceKey2 = "" + pollID + 2;
        this.pollChoices.put(choiceKey2, opt2);
        this.votes.put(choiceKey2, "0");

        choiceKey3 = "" + pollID + 3;
        this.pollChoices.put(choiceKey3, opt3);
        this.votes.put(choiceKey3, "0");

        choiceKey4 = "" + pollID + 4;
        this.pollChoices.put(choiceKey4, opt4);
        this.votes.put(choiceKey4, "0");

        return pollID;

    },




}

module.exports = voter