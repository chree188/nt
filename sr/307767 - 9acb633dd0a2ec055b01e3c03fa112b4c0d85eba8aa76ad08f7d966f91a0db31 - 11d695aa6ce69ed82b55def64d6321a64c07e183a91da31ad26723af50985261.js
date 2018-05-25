
// TX Hash	dbd6ea35fceef121f28c9e6a30fc9abf1fd193a55533a88d006a874b4e681d00
// Contract address	n1qFELY9hFPqDzj5yHBX5qm4YGSRa7LcC3h

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

function lastCheckDay(dayArr) {
    var len = dayArr.length;
    if (len <= 0) {
        return 0;
    } else {
        return dayArr[len - 1].day;
    }
}

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
        var from = Blockchain.transaction.from;
        var teamItem = this.teamDB.get(teamId);
        if (!teamId || parseInt(teamId) < 0 || parseInt(teamId) > 29){
            throw new Error('请输入正确的 teamId！');
        }
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

