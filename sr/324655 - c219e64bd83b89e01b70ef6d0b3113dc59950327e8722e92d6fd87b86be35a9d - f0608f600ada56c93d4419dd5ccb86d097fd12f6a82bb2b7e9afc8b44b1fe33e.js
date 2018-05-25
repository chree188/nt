"use strict";

//player item , contains : name , score
var PlayerItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.name = obj.name;
        this.address=obj.address;
        this.score = obj.score;
    } else {
        this.name = "";
        this.score = "";
        this.address="";
    }
};

PlayerItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

//ScoreBoard
var ScoreBoard = function (obj) {
    this.scoreBoard = {};
    this.scoreArray={};
    this.parse(obj);
}

ScoreBoard.prototype = {
    toString: function () {
        return JSON.stringify(this.scoreBoard);
    },

    parse: function (obj) {
        if (typeof obj != "undefined") {
            var data = JSON.parse(obj);
            //game name key
            for (var gamename in data) {
                for(var key in data[gamename]) {
                    if(!this.scoreBoard[gamename]){
                        this.scoreBoard[gamename]={};
                    }
                    //rebuild score array
                    var playerItem = new PlayerItem();
                    playerItem.name = data[gamename][key].name;
                    playerItem.address = data[gamename][key].address;
                    playerItem.score = new BigNumber(data[gamename][key].score);

                    this.scoreBoard[gamename][key] =playerItem;

                    if (!(this.scoreArray[gamename] instanceof Array)) {
                    this.scoreArray[gamename] = new Array();
                     }
                    this.scoreArray[gamename].push(playerItem);
                    this.scoreArray[gamename].sort((a,b)=>{return  b.score - a.score});
                }
            }
        }
    },

    get: function (gamename, key) {
        if(!this.scoreBoard[gamename]){
            return null;
        }
        return this.scoreBoard[gamename][key];
    },

    set: function (gamename, key, name, address , value) {
        if(!this.scoreBoard[gamename]){
            this.scoreBoard[gamename]={};
        }
        var playerItem = new PlayerItem();
        playerItem.name = name;
        playerItem.address = address;
        playerItem.score = value;

        this.scoreBoard[gamename][key] = playerItem;
        //reparse this obj
        this.scoreArray[gamename]=new Array();
        this.parse(JSON.stringify(this.scoreBoard));

        console.log("scoreArray"+this.scoreArray[gamename]);
        console.log("scoreArrayLength"+this.scoreArray[gamename].length);
        if(this.scoreArray[gamename] && this.scoreArray[gamename].length>10){
            var playerItem=this.scoreArray[gamename].pop();
            delete this.scoreBoard[gamename][playerItem.name+playerItem.address];
        }
    },

    getTop10: function(gamename){
        return this.scoreArray[gamename];
    }
}


//leaderboard contract
var Leaderboard = function () {

    LocalContractStorage.defineProperties(this, {
        topTen: {
            parse: function (value) {
                return new ScoreBoard(value);
            },
            stringify: function (o) {
                return o.toString();
            }
        },
    });
};

Leaderboard.prototype = {
    init: function () {
        console.log("in init");
        this.topTen=new ScoreBoard();
    },

    //save name, address and score to scoreMap
    save: function (gamename, name, score) {

        gamename=gamename.trim();
        name = name.trim();
        var address= Blockchain.transaction.from;
        score = score.trim();
        if (gamename==="" || name === "" || score === "" || address ===""){
            throw new Error("empty game name / name / address / score");
        }
        if (name.length > 64){
            throw new Error("name exceed limit length");
        }

        var topTen=this.topTen;
        var playerItem = topTen.get(gamename, name+address);

        if(playerItem){
            if(Number(playerItem.score)<Number(score)){
                throw new Error("the score is lower then the earlier one!");
            }
            topTen.set(gamename, name+address,name, address, score);

        }else{
            topTen.set(gamename, name+address,name, address, score);

        }
        this.topTen=topTen;
        console.log("in save: "+this.topTen);
        return true;
    },

    query: function (gamename) {
        console.log("in query: "+this.topTen);
        return this.topTen.getTop10(gamename);
    },

};
module.exports = Leaderboard;