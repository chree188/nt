"use strict";

var Player = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.name = obj.name;
        this.score = obj.score;
    } else {
        this.name = "";
        this.score = 0; //
    }
};

Player.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var Tetris = function() {
    LocalContractStorage.defineMapProperty(this, "players", {
        parse: function(text) {
            return new Player(text);
        },
        stringify: function(o) {
            return o.toString();
        }
    });
};

//ä¿ç½æ¯æ¹å
Tetris.prototype = {
    init: function() {
        // todo
    },
    pay: function() {
        var from = Blockchain.transaction.from;
        var player = new Player();
        player.name = from;
        player.score = 0;
        this.players.put(from, player);
    },
    get: function() {
        var from = Blockchain.transaction.from;
        return this.players.get(from);
    },
    score: function(score) {
        var from = Blockchain.transaction.from;
        var player = new Player();
        player.name = from;
        player.score = score;
        this.players.put(from, player);
    }
};
module.exports = Tetris;