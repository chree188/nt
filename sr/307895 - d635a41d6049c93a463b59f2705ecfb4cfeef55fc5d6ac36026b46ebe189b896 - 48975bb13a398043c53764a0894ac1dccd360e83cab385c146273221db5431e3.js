

// TX Hash	11d695aa6ce69ed82b55def64d6321a64c07e183a91da31ad26723af50985261
// Contract address	n1uP9W685rV2dbugDbWpxy9SYCv2EpMJDva

'use strict';

var TeamItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.favUsers = obj.favUsers;
        this.favNumer = obj.favNumer;
    } else {
        this.favUsers = [];
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
        teamItem.favUsers.push(from);
        teamItem.favNumer = teamItem.favNumer+1;
        this.teamDB.put(teamId, teamItem);
    },
    favoriteNumerOfTeam: function (teamId) {
        var from = Blockchain.transaction.from;
        var teamItem = this.teamDB.get(from);
        if (!teamItem) {
            teamItem = new TeamItem(null)
        }
        return teamItem ? teamItem.toString() : '';
    }
}

module.exports = NBAContract;

