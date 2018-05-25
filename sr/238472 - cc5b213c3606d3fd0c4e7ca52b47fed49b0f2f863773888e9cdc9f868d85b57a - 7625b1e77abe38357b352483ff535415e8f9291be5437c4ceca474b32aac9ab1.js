"use strict";

var TeamNameItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.key = obj.key;
		this.name = obj.name;
		this.associated_teams = obj.associated_teams;
		this.author = obj.author;
		this.votes = obj.votes;
		this.votedAddresses = obj.votedAddresses;
	} else {
	    this.key = "";
	    this.author = "";
			this.name = "";
	    this.associated_teams = "";
			this.votes = 0;
			this.votedAddresses = [];
	}
};

TeamNameItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var FantasyFootballTeamNames = function () {
	LocalContractStorage.defineMapProperty(this, "teamNames")
	LocalContractStorage.defineProperty(this, "teamNameCount", null)
};

FantasyFootballTeamNames.prototype = {
    init: function () {
      this.teamNameCount = 0;
    },

    save: function (name, associated_teams) {

			name = name.trim();
			associated_teams = associated_teams.trim();
			if (name === ""){
				throw new Error("empty team name");
			}

      var from = Blockchain.transaction.from;
			var teamNameCount = new BigNumber(this.teamNameCount).plus(1)

      var teamName = new TeamNameItem();
      teamName.author = from;
      teamName.key = teamNameCount;
			teamName.name = name;
      teamName.associated_teams = associated_teams.split(',');
			teamName.votes = 0;
			teamName.votedAddresses = [];

			this.teamNames.put(teamNameCount, teamName);
			this.teamNameCount = teamNameCount;
			return true;
    },

    getAllTeamNames: function () {
      var teamNames = [];
			var teamNameCount = +this.teamNameCount;

			for (var i = 1; teamNameCount >= i; i++) {
	      teamNames.push(this.teamNames.get(i));
	    }

			return teamNames;
    },

		getTeamNamesByAssociatedTeam: function (associated_team) {
			var teamNames = [];
			var teamNameCount = +this.teamNameCount;

			for (var i = 1; teamNameCount >= i; i++) {
	      var t = this.teamNames.get(i);
				if (t.associated_teams.includes(associated_team)) {
					teamNames.push(t);
				}
	    }

			return teamNames;
		},

		upvoteTeamName(key) {
			var from = Blockchain.transaction.from;
			var teamName = this.teamNames.get(key);
			if (!teamName) {
				throw new Error("team name does not exist");
			} else if (teamName.votedAddresses.includes(from)) {
				throw new Error("user has already voted!");
			}

			teamName.votes = new BigNumber(teamName.votes).plus(1);
			teamName.votedAddresses.push(from);
			this.teamNames.put(key, teamName);

		}
};

module.exports = FantasyFootballTeamNames;