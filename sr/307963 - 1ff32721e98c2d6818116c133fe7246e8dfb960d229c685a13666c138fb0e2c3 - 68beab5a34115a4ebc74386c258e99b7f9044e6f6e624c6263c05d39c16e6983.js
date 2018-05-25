

// TX Hash	48975bb13a398043c53764a0894ac1dccd360e83cab385c146273221db5431e3
// Contract address	n1opgQ762pXztUTakv8vDGG7SLLC8uXmdMf
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
        // var from = Blockchain.transaction.from;
        // var teamItem = this.teamDB.get(teamId);
        // if (!teamItem) {
        //     teamItem = new TeamItem(null)
        // }
        // var favUsers = JSON.parse(teamItem.favUsers);
        // favUsers.push(from);
        // teamItem.favUsers = JSON.stringify(favUsers);
        // teamItem.favNumer = teamItem.favNumer+1;
        // this.teamDB.put(teamId, teamItem);
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
    }
}

module.exports = NBAContract;

