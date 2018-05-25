"use strict";

var playerGame=function () {

};

playerGame.prototype={
    init: function () {
    },
    letItGo:function () {
        return Math.floor(Math.random()*3);
    }
};

module.exports = playerGame;
