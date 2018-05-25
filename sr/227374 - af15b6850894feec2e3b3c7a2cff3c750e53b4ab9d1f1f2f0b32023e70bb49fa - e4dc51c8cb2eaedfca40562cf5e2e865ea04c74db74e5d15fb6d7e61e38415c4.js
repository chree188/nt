"use strict";
var SucksSong = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.song_name = obj.song_name;
        this.singer = obj.singer;
        this.score = obj.score;
        this.author = obj.author;
        this.describe = obj.describe;
        this.date = obj.date;
    } else {
        this.song_name = "";
        this.singer = "";
        this.author = "";
        this.score = "";
        this.describe = "";
        this.date = "";
    }
};
SucksSong.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};
var SucksSongContract = function () {
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new SucksSong(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this,"arrayMap");
    LocalContractStorage.defineMapProperty(this,"dataMap");
    LocalContractStorage.defineProperty(this,"size");
    LocalContractStorage.defineProperty(this,"top10SucksSongs");
};
SucksSongContract.prototype = {
    init: function () {
        this.size = 0;
    },
    getTop10:function(){
        return this.top10SucksSongs;
    },
    sort:function(){
        var size = this.size;
        var result = [];
        var max = 999999999;
        for(var i=0;i<size;i++){
            var temp = -1;
            var temp_map = this.dataMap.get(this.arrayMap.get(i));
            for(var k=0;k<size;k++){
                if(this.dataMap.get(this.arrayMap.get(k)).score>=max){
                    continue;
                }
                if(this.dataMap.get(this.arrayMap.get(k)).score>temp){
                    temp = this.dataMap.get(this.arrayMap.get(k)).score;
                    temp_map = this.dataMap.get(this.arrayMap.get(k));
                }
            }
            result[i] = temp_map;
            max = temp;
        }
        var top = 10;
        if(size<top){
            top = size;
        }
        var top10 = result.slice(0,top);
        LocalContractStorage.set("top10SucksSongs",top10);
        return top10;
    },
    save: function (song_name, singer, describe, date) {
        var score = 1;
        describe = describe.trim();
        singer = singer.trim();
        song_name = song_name.trim();
        if (song_name === ""){
            throw new Error("empty song_name");
        }
        var from = Blockchain.transaction.from;
        var sucksSong = this.repo.get(song_name);
        if (sucksSong){
            throw new Error("song name has been occupied");
        }
        sucksSong = new SucksSong();
        sucksSong.author = from;
        sucksSong.describe = describe;
        sucksSong.song_name = song_name;
        sucksSong.singer = singer;
        sucksSong.score = score;
        sucksSong.date = date;
        this.repo.put(song_name, sucksSong);
        var index = this.size;
        this.arrayMap.set(index,song_name);
        this.dataMap.set(song_name,sucksSong);
        this.size += 1;
        this.sort();
        return sucksSong;
    },
    get: function (song_name) {
        song_name = song_name.trim();
        if ( song_name === "" ) {
            throw new Error("empty song_name")
        }
        return this.repo.get(song_name);
    },
    like:function(song_name){
        if(song_name){
            var sucksSong = this.get(song_name);
            var score = sucksSong.score;
            score += 1;
            sucksSong.score = score;
            this.dataMap.set(song_name,sucksSong);
            this.repo.set(song_name,sucksSong);
            this.sort();
            return sucksSong;
        }else{
            throw new Error("input song name is not valid");
        }
    },
    notlike:function(song_name){
        if(song_name){
            var sucksSong = this.get(song_name);
            var score = sucksSong.score;
            score -= 1;
            if(score<0){
                score = 0;
            }
            sucksSong.score = score;
            this.dataMap.set(song_name,sucksSong);
            this.repo.put(song_name,sucksSong);
            this.sort();
            return sucksSong;
        }else{
            throw new Error("input song name is not valid");
        }
    },
    len:function(){
        return this.size;
    },
    forEach:function(limit,offset){
        limit = parseInt(limit);
        offset = parseInt(offset);
        if(offset>this.size){
            throw new Error("offset is not valid");
        }
        var number = offset+limit;
        if(number>this.size){
            number = this.size;
        }
        var result = [];
        var j = 0;
        for(var i=offset;i<number;i++){
            var key = this.arrayMap.get(i);
            var object = this.dataMap.get(key);
            result[j] = '{"song_name":"'+object.song_name+'","singer":"'+object.singer+'",describe":"'+object.describe+'","score:"'+object.score+'","author:"'+object.author+'","date":"'+object.date+'"}';
            j++;
        }
        return result;
    }
};
module.exports = SucksSongContract;