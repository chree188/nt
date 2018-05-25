"use strict";

var Award = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.person = obj.person;
        this.content = obj.content;
        this.publicer = obj.publicer;
        this.timestamp = obj.timestamp;
    } else {
        this.person = "";
        this.content = "";
        this.publicer = "";
        this.timestamp = "";
    }
};

Award.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var AwardTool = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new Award(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

AwardTool.prototype = {
    init: function () {
    },

    add: function (publicer, person,content,code) {

        var timestamp = Blockchain.transaction.timestamp;
        var award = this.repo.get(code);
        if (award){
            throw new Error("奖状编号已存在");
        }

        award = new Award();
        award.person = person;
        award.content = content;
        award.publicer = publicer;
        award.timestamp = timestamp;


        this.repo.put(code, award);
    },

    get: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("empty key")
        }
        return this.repo.get(key);
    }
};
module.exports = AwardTool;