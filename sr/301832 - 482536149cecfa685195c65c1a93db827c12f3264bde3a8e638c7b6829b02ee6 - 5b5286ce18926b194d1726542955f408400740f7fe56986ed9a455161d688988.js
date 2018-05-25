"use strict";

var GameItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.win = obj.win;
		this.lose = obj.lose;
		this.tie = obj.tie;
	} else {
	    this.win = 0;
	    this.lose = 0;
	    this.tie = 0;
	}
};

GameItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var WcFixture = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new GameItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

WcFixture.prototype = {
    init: function () {
        // todo
    },

    save: function (key, value) {

        key = key.trim();
        value = parseInt(value.trim(),10);
        if (key === "" || value === ""){
            throw new Error("empty key / value");
        }
        if (value.length > 64 || key.length > 64){
            throw new Error("key / value exceed limit length")
        }

        var origin_gameItem = this.repo.get(key);
        var gameItem = new GameItem();
        if (origin_gameItem) {
            gameItem = Object.assign(gameItem,origin_gameItem);
        }

        switch(value) {
            case 1:
                gameItem.win = gameItem.win + 1;
            case 0:
                gameItem.tie = gameItem.tie + 1;
            case -1:
                gameItem.lose = gameItem.lose + 1;
        }

        this.repo.put(key, gameItem);
    },

    get: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("empty key")
        }
        return this.repo.get(key);
    }
};
module.exports = WcFixture;