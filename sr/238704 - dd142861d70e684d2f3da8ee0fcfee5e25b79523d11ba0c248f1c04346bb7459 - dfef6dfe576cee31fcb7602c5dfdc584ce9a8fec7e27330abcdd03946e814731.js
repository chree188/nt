"use strict";

var SupporterVoteItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);

        this.teamIds = obj.teamIds;
    } else {
        this.teamIds = "";
    }
};

SupporterVoteItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var FootballVoteItem = function (text) {
    if (text) {
        //var timestamp = new Date().getTime();

        var obj = JSON.parse(text);

        this.author = obj.author;
        this.ip = obj.ip;
        //this.time = timestamp;
        this.time = "0";
        this.teamId = obj.teamId;
        this.supportNum = obj.supportNum;
    } else {
        this.author = "";
        this.ip = "";
        this.time = "";
        this.teamId = "";
        this.supportNum = "";
    }
};

FootballVoteItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var FootballForecast = function () {
    LocalContractStorage.defineMapProperty(this, "forecast", {
        parse: function (text) {
            return new FootballVoteItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineMapProperty(this, "supporters", {
        parse: function (text) {
            return new SupporterVoteItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineProperty(this, "size");
};

FootballForecast.prototype = {
    init: function () {
        this.size = 0;
        var teams = new Array(
            "danmai",
            "wulagui",
            "yilang",
            "erluoshi",
            "keluodya",
            "bingdao",
            "gelunbiya",
            "gesidalijia",
            "aiji",
            "saierjiaer",
            "saierweiya",
            "moxige",
            "niriliya",
            "banama",
            "baxi",
            "deguo",
            "moluoge",
            "riben",
            "bilishi",
            "shate",
            "faguo",
            "bolan",
            "aodaliya",
            "ruidian",
            "ruishi",
            "milu",
            "tunisi",
            "yinggelan",
            "putaoya",
            "xibanya",
            "agenting",
            "hanguo"
            );

        for (var i = 0; i < 32; i++)
        {
            var from = Blockchain.transaction.from;
            var footballVoteItem = new FootballVoteItem();
            footballVoteItem.author = from;
            footballVoteItem.teamId = teams[i];
            footballVoteItem.ip = "127.0.0.1";
            footballVoteItem.supportNum = 0;
            this.forecast.put(teams[i], footballVoteItem);
            var index = this.size;
            this.arrayMap.set(index, teams[i]);
            this.size += 1;
        }

    },

    launch: function (ip, teamId) {
        ip = ip.trim();
        teamId = teamId.trim();

        if (ip === "" || teamId === "") {
            throw new Error("empty ip or teamId");
        }
        if (ip.length > 64 || teamId.length > 64) {
            throw new Error("ip or teamId exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var footballVoteItem = this.forecast.get(teamId);
        if (footballVoteItem) {
            throw new Error("teamId has been occupied");
        }

        var supporterVoteItem = this.supporters.get(from);
        if (supporterVoteItem) {
            for (var i = 0; i < supporterVoteItem.teamIds.length; i++) {
                if (teamId === supporterVoteItem.teamIds[i]) {
                    throw new Error("supporter has been occupied");
                }
            }
        }

        footballVoteItem = new FootballVoteItem();
        footballVoteItem.author = from;
        footballVoteItem.teamId = teamId;
        footballVoteItem.ip = ip;
        footballVoteItem.supportNum = 0;

        supporterVoteItem = new SupporterVoteItem();
        var teamIds = new Array();
        teamIds[0] = from;
        supporterVoteItem.teamIds = teamIds;

        this.forecast.put(teamId, footballVoteItem);
        //this.supporters.put(from, supporterVoteItem);
        var index = this.size;
        this.arrayMap.set(index, teamId);
        this.size += 1;

    },


    vote: function (ip, teamId) {
        ip = ip.trim();
        teamId = teamId.trim();

        if (ip === "" || teamId === "") {
            throw new Error("empty ip or teamId");
        }
        if (ip.length > 64 || teamId.length > 64) {
            throw new Error("ip or teamId exceed limit length")
        }

        var from = Blockchain.transaction.from;

        var footballVoteItem = this.forecast.get(teamId);
        if (!footballVoteItem) {
            throw new Error("teamId not found");
        }

        var supporterVoteItem = this.supporters.get(from);
        if (supporterVoteItem) {
            for (var i = 0; i < supporterVoteItem.teamIds.length; i++) {
                if (teamId === supporterVoteItem.teamIds[i]) {
                    throw new Error("supporter has been occupied");
                }
            }
            supporterVoteItem.teamIds[supporterVoteItem.teamIds.length] = teamId;
        } else {
            supporterVoteItem = new SupporterVoteItem();
            supporterVoteItem.teamIds = new Array();
            supporterVoteItem.teamIds[0] = teamId;
        }

        footballVoteItem.supportNum = footballVoteItem.supportNum + 1;

        this.forecast.set(teamId, footballVoteItem);
        this.supporters.set(from, supporterVoteItem);
    },

    query: function (teamId) {
        teamId = teamId.trim();

        if (teamId === "") {
            throw new Error("empty teamId");
        }
        if (teamId.length > 64) {
            throw new Error("teamId exceed limit length")
        }

        var footballVoteItem = this.forecast.get(teamId);
        if (!footballVoteItem) {
            throw new Error("teamId not found");
        }
        return {
            "method": "query",
            "supportNum": footballVoteItem.supportNum
        }
        
    },
    queryall: function () {
        var allteams = new Array();
        for (var i = 0; i < this.size; i++) {
            var key = this.arrayMap.get(i);
            allteams.push(this.forecast.get(key));
        }
        return allteams;
    },

    who_teamId: function (teamId) {
        teamId = teamId.trim();

        if (teamId === "") {
            throw new Error("empty teamId");
        }
        if (teamId.length > 64) {
            throw new Error("teamId exceed limit length")
        }

        var footballVoteItem = this.forecast.get(teamId);
        if (!footballVoteItem) {
            throw new Error("teamId not found");
        }

        return footballVoteItem;
    },
    who_supporter: function () {
        var from = Blockchain.transaction.from;

        var supporterVoteItem = this.supporters.get(from);
        if (!supporterVoteItem) {
            //throw new Error("vote info not found");
            supporterVoteItem = "";
        }

        return {
            "method": "who_supporter",
            "supporterVoteItem": supporterVoteItem
        }
    },
};
module.exports = FootballForecast;