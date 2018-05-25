"use strict";

//player item , contains : name , score
var PlayerItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.name = obj.name;
        this.score = obj.score;
    } else {
        this.name = "";
        this.score = "";
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
    this.mapSize=0;
    this.scoreArray=new Array();
    this.parse(obj);
}

ScoreBoard.prototype = {
    toString: function () {
        return JSON.stringify(this.scoreBoard);
    },

    parse: function (obj) {
        if (typeof obj != "undefined") {
            var data = JSON.parse(obj);
            for (var key in data) {
                this.scoreBoard[key] = new BigNumber(data[key]);
                this.mapSize=this.mapSize+1;
                //rebuild score array
                var playerItem=new PlayerItem();
                playerItem.name=key;
                playerItem.score=new BigNumber(data[key]);
                this.scoreArray.push(playerItem);
                this.scoreArray.sort((a,b)=>{return  b.score - a.score});

            }
        }
    },

    get: function (key) {
        return this.scoreBoard[key];
    },

    set: function (key, value) {
        this.scoreBoard[key] = new BigNumber(value);
        var playerItem=new PlayerItem();
        playerItem.name=key;
        playerItem.score=new BigNumber(value);
        this.scoreArray.push(playerItem);
        this.scoreArray.sort((a,b)=>{return  b.score - a.score});
        this.mapSize=this.mapSize+1;
        if(this.scoreArray.length>10){
            var playerItem=this.scoreArray.pop();
            delete this.scoreBoard[playerItem.name];
            this.mapSize=this.mapSize-1;
        }
    },
    getTop10: function(){
        return this.scoreArray;
    },

    delete: function (key){
        delete this.scoreBoard[key];
        this.mapSize=this.mapSize-1;
    },
    size: function(){
        return this.mapSize;
    }
}


//leaderboard contract
var Leaderboard = function () {
    LocalContractStorage.defineMapProperty(this, "scoreMap", {
        parse: function (text) {
            return new PlayerItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineProperties(this, {
        mapSize: 0,
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
        this.mapSize=0;
        this.topTen=new ScoreBoard();
    },

    //save name and score to scoreMap
    save: function (name, score) {

        name = name.trim();
        score = score.trim();
        if (name === "" || score === ""){
            throw new Error("empty name / score");
        }
        if (name.length > 64){
            throw new Error("name exceed limit length")
        }

        var topTen=this.topTen;
        var playerItem = topTen.get(name);

        if(playerItem){
            if(Number(playerItem.score)<Number(score)){
                throw new Error("the score is lower then the earlier one!");
            }
            topTen.set(name,score);

        }else{
                    topTen.set(name,score);
                    this.mapSize=this.mapSize+1;

        }
        this.topTen=topTen;
        console.log("in save: "+this.topTen);
        return true;
    },

    query: function () {
        console.log("in query: "+this.topTen);
        return this.topTen.getTop10();
    },

};
module.exports = Leaderboard;