

// TX Hash	3ba5ff08355f97297c0f684e630eba42f52170420010a789f06566e79ff4b389
// Contract address	n1eP1hXdxqiskgqpVMEGAZfnWmpdbUdZ2L9

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
            var teamId = index + '';
            var teamItem = this.teamDB.get(teamId);
            teamList.push(teamItem.favNumer);
        }
        return teamList ? JSON.stringify(teamList) : '';
    }
}

module.exports = NBAContract;

