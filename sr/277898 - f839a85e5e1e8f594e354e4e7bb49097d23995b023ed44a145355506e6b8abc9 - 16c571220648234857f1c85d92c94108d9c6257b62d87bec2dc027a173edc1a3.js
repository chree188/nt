"use strict";

var Movie = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id;
        this.name = obj.name;
    } else {
        this.id = 0;
        this.name = "";
    }
};

Movie.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var MovieRecord = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.id1 = obj.id1;
        this.id2 = obj.id2;
        this.id3 = obj.id3;
        this.id4 = obj.id4;
        this.id5 = obj.id5;
        this.id6 = obj.id6;
        this.id7 = obj.id7;
        this.id8 = obj.id8;
        this.id9 = obj.id9;
        this.id10 = obj.id10;
        this.name1 = obj.name1;
        this.name2 = obj.name2;
        this.name3 = obj.name3;
        this.name4 = obj.name4;
        this.name5 = obj.name5;
        this.name6 = obj.name6;
        this.name7 = obj.name7;
        this.name8 = obj.name8;
        this.name9 = obj.name9;
        this.name10 = obj.name10;
    } else {
        this.id1 = 0;
        this.id2 = 0;
        this.id3 = 0;
        this.id4 = 0;
        this.id5 = 0;
        this.id6 = 0;
        this.id7 = 0;
        this.id8 = 0;
        this.id9 = 0;
        this.id10 = 0;
        this.name1 = "";
        this.name2 = "";
        this.name3 = "";
        this.name4 = "";
        this.name5 = "";
        this.name6 = "";
        this.name7 = "";
        this.name8 = "";
        this.name9 = "";
        this.name10 = "";
    }
};

MovieRecord.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};


var GuessMovieContract = function () {
   LocalContractStorage.defineMapProperty(this, "dataMap");
   LocalContractStorage.defineMapProperty(this, "movieMap");
   LocalContractStorage.defineProperty(this, "size");
};

GuessMovieContract.prototype = {
    init: function () {
        this.size = 0;
        var names = new Array(
            "1","2","3","4","5","6","7","8","9","10",
            "11","12","13","14","15","16","17","18","19","20"
        );
        for(var i=0; i<20; i++){
            var movie = new Movie();
            movie.id = i;
            movie.name = names[i];
            this.dataMap.set(i, movie);
        }

    },

    getTenMovie: function () {
		//讲上次存入的电影ID返回
        var object = this.movieMap.get(this.size - 1);
        var idArr = [object.id1,object.id2,object.id3,object.id4,object.id5,
            object.id6,object.id7,object.id8,object.id9,object.id10];
        return JSON.stringify(idArr);
    },

    setTenMovie:function () {
        var index = this.size;
        //在所有的电影中随机获得10部电影，存入movieMap中
        var idArr = [];
        var nameArr = [];
        var json = {};
        while(idArr.length < 10){
            var k = Math.round(Math.random()*20) - 1;
            if(!json[k]){
                json[k]=true;
                idArr.push(k+1);
                nameArr.push(this.dataMap.get(k).name);
            }
        }
        var record = new MovieRecord();
        record.id1 = idArr[0];
        record.id2 = idArr[1];
        record.id3 = idArr[2];
        record.id4 = idArr[3];
        record.id5 = idArr[4];
        record.id6 = idArr[5];
        record.id7 = idArr[6];
        record.id8 = idArr[7];
        record.id9 = idArr[8];
        record.id10 = idArr[9];
        record.name1 = nameArr[0];
        record.name2 = nameArr[1];
        record.name3 = nameArr[2];
        record.name4 = nameArr[3];
        record.name5 = nameArr[4];
        record.name6 = nameArr[5];
        record.name7 = nameArr[6];
        record.name8 = nameArr[7];
        record.name9 = nameArr[8];
        record.name10 = nameArr[9];
        this.movieMap.set(index,record);
        this.size += 1;
    },

    getmMovie: function (key) {
        return this.movieMap.get(key);
    },

    len:function(){
      return this.size;
    },

    getAnswer: function (movie1,movie2,movie3,movie4,movie5,movie6,movie7,movie8,movie9,movie10){
        var object = this.movieMap.get(this.size - 1);
        var result = 0;
        if(object.name1 == movie1){
            result += 1;
        }
        if(object.name2 == movie2){
            result += 1;
        }
        if(object.name3 == movie3){
            result += 1;
        }
        if(object.name4 == movie4){
            result += 1;
        }
        if(object.name5 == movie5){
            result += 1;
        }
        if(object.name6 == movie6){
            result += 1;
        }
        if(object.name7 == movie7){
            result += 1;
        }
        if(object.name8 == movie8){
            result += 1;
        }
        if(object.name9 == movie9){
            result += 1;
        }
        if(object.name10 == movie10){
            result += 1;
        }
        return result;
    },


};

module.exports = GuessMovieContract;