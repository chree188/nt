

// TX Hash	82bf7e35e6997d5851f01855d1a362d98819c1924ec3daaa3f0daf1f2545e45b
// Contract address	n1xu8wZ9umDgicVVBRshSDtygm6VoTe9oaz

'use strict';

var TeamItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.favUsers = obj.favUsers;
        this.favNumer = obj.favNumer;
    } else {
        this.favUsers = '[]';
        this.favNumer = 0;
    }
};

TeamItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var NBAContract = function () {
    LocalContractStorage.defineMapProperty(this, 'teamDB', {
        parse: function (str) {
            return new TeamItem(str);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

NBAContract.prototype = {
    init: function () {},
    favoriteTeam: function (teamId) {
        teamId = teamId.trim();
        if (!teamId || parseInt(teamId) < 0 || parseInt(teamId) > 29) {
            throw new Error('请输入正确的 teamId！');
        }
        var from = Blockchain.transaction.from;
        var teamItem = this.teamDB.get(teamId);
        if (!teamItem) {
            teamItem = new TeamItem(null)
        }
        var favUsers = JSON.parse(teamItem.favUsers);
        favUsers.push(from);
        teamItem.favUsers = JSON.stringify(favUsers);
        teamItem.favNumer = teamItem.favNumer+1;
        this.teamDB.put(teamId, teamItem);
    },
    favoriteNumerOfTeam: function (teamId) {
        teamId = teamId.trim();
        if (!teamId || parseInt(teamId) < 0 || parseInt(teamId) > 29) {
            throw new Error('请输入正确的 teamId！');
        }
        var from = Blockchain.transaction.from;
        var teamItem = this.teamDB.get(teamId);
        if (!teamItem) {
            teamItem = new TeamItem(null)
        }
        return teamItem ? teamItem.toString() : '';
    },
    favoriteListNumerOfTeam: function () {
        var teamList = [];
        for (var index = 0; index < 30; index++) {
            var teamItem = this.teamDB.get(index+'');
            teamList.push(teamItem.favNumer);
        }
        return teamList ? teamList.toString() : '';
    }
}

module.exports = NBAContract;

