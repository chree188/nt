"use strict";

var ScoreItem = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.score = obj.score;
        this.author = obj.author;
    } else {
        this.score = "";
        this.author = "";
    }
};

ScoreItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var Snake = function () {

    LocalContractStorage.defineProperty(this, "size");
    LocalContractStorage.defineProperty(this, "MaxRankingListLength");
    LocalContractStorage.defineMapProperty(this, "snakeMap", {
        parse: function (text) {
            return new ScoreItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

Snake.prototype = {
    init: function () {
        this.size = 0;
        this.MaxRankingListLength = 3;
    },

    save: function (score) {

        score = parseInt(score);
        if (score === "" || score % 1 != 0){
            score = 0;
        }

        //Create a scoreitem.
        var from = Blockchain.transaction.from;
        var scoreItem = new ScoreItem();
        scoreItem.score = score;
        scoreItem.author = from;

        //if there is not enough data, we need to add
        //them into localstorage.
        if (this.size < this.MaxRankingListLength){
            this.snakeMap.put(this.size, scoreItem);
            this.size += 1; 
        }else{
            //Get all snakemap, and store them into an array.
            var rankingList = new Array();
            for(var i = 0; i < this.MaxRankingListLength; i++){
                rankingList[i] = this.snakeMap.get(i);
            }
            //sort them
            rankingList.sort(function(a, b){
                return a.score - b.score;
            })
            //put the array replace the localstorage in blockchain
            for(var i = 0; i < this.MaxRankingListLength; i++){
                this.snakeMap.put(i, rankingList[i]);
            }
            //if new score is greater than the lowest score, put it into
            //snakemap.
            if (score > rankingList[0].score){
                this.snakeMap.put(0, scoreItem);
            }
        }
    },

    getRankingListTop3: function(){
        var RankingList = new Array();
        for(var i = 0; i < this.size; i++){
            RankingList[i] = this.snakeMap.get(i);
        }
        return RankingList;
    },

    getRankingList: function(index){
        index = index.trim();
        return this.snakeMap.get(index);
    },
};
module.exports = Snake;