"use strict";

var Joke = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id;
        this.content = obj.content;
        this.author = obj.author;
        this.submitTime = obj.submitTime;
        this.good = obj.good;
    } else {
        this.id = 0;
        this.content = "";
        this.author = "";
        this.submitTime = "";
        this.good = 0;
    }
};

Joke.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var ShareJokeContract = function () {
   LocalContractStorage.defineMapProperty(this, "goodMap");
   LocalContractStorage.defineProperty(this, "goodId");

   LocalContractStorage.defineMapProperty(this, "dataMap");
   LocalContractStorage.defineProperty(this, "size");
};

ShareJokeContract.prototype = {
    init: function () {
        this.size = 0;
    },

    saveJoke: function (content, submitTime) {
        var id = this.size;
        var from = Blockchain.transaction.from;

        var joke = new Joke();
        joke.id = id;
        joke.content = content;
        joke.author = from;
        joke.submitTime = submitTime;
        this.dataMap.put(index,joke);

        this.size += 1;
    },

    get: function (id) {
        id = id.trim();
        if ( id === "" ) {
            throw new Error("empty id")
        }
        return this.dataMap.get(id);
    },

    getAll: function () {
        //根据登陆用户查询他点赞的笑话id
        var from = Blockchain.transaction.from;
        var goodjokes = [];
        for(var i=0; i<this.goodId; i++){
            if(this.goodMap.get(i).from == from){
                goodjokes.push(this.goodMap.get(i).jokeId);
            }
        }
        var result  = [];
        for(var i=0; i<this.size; i++){
            var flag = 0;
            for(var j=0; j<goodjokes.length; j++){
                if(goodjokes[j] == this.dataMap.get(i).id){
                    flag = 1;
                    break;
                }
            }
            var joke = this.dataMap.get(i);
            if(flag == 0){
                joke.good = 0;
            }else{
                joke.good = 1;
            }
            result.push(joke);
        }
        return JSON.stringify(result);
    },

    len:function(){
      return this.size;
    },

    good:function (jokeId) {
        var goodId = this.goodId;
        var from = Blockchain.transaction.from;

        var flag = 1;
        for(var i=0; i<goodId; i++){
            if(this.goodMap.get(i).from == from &&
                this.goodMap.get(i).jokeId == jokeId){
                flag = 2;
                break;
            }
        }
        if(flag == 1){
            this.goodMap.put(index,{
                goodId : goodId,
                jokeId : jokeId,
                from : from
            });
            this.goodId += 1;
        }
    },

    getGood:function (goodId) {
        goodId = goodId.trim();
        if ( goodId === "" ) {
            throw new Error("empty goodId")
        }
        return this.goodMap.get(goodId);
    }

};

module.exports = ShareJokeContract;