"use strict";

var DataItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.nickname = obj.nickname ;
        this.owner = obj.owner;
    } else {
        this.nickname = "";
        this.owner = "";
    }
};

DataItem .prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var NicknamesRegister = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new DataItem (text);
        },
        stringify: function (param) {
            return param.toString();
        }
    });
};

NicknamesRegister.prototype = {
    init: function () {

    },

    save: function (nickname) {

        nickname = nickname.trim();

        if (nickname === ""){
            throw new Error("empty nickname!");
        }

        if (nickname.length > 64){
            throw new Error("nickname exceed limit length")
        }

        var from = Blockchain.transaction.from;
        var dataItem = this.repo.get(nickname);
        if (dataItem){
            throw new Error("nickname is already occupied");
        }

        dataItem = new DataItem();
        dataItem.owner = from;
        dataItem.nickname = nickname;

        this.repo.put(nickname, dataItem);
    },

    get: function (nickname) {
        nickname = nickname.trim();
        if ( nickname === "" ) {
            throw new Error("empty nickname")
        }
        return this.repo.get(nickname);
    }
};

module.exports = NicknamesRegister;
