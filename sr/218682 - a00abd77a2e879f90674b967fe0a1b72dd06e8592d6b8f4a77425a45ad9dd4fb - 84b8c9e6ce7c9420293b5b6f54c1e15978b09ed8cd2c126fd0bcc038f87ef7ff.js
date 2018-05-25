    "use strict";
    var SucksMovie = function(text) {
    	if (text) {
    		var obj = JSON.parse(text);
    		this.movie_name = obj.movie_name;
    		this.score = obj.score;
    		this.author = obj.author;
            this.describe = obj.describe;
            this.date = obj.date;
    	} else {
    	    this.movie_name = "";
    	    this.author = "";
    	    this.score = "";
            this.describe = "";
            this.date = "";
    	}
    };
    SucksMovie.prototype = {
    	toString: function () {
    		return JSON.stringify(this);
    	}
    };
    var SucksMovieContract = function () {
        LocalContractStorage.defineMapProperty(this, "repo", {
            parse: function (text) {
                return new SucksMovie(text);
            },
            stringify: function (o) {
                return o.toString();
            }
        });
        LocalContractStorage.defineMapProperty(this,"arrayMap");
        LocalContractStorage.defineMapProperty(this,"dataMap");
        LocalContractStorage.defineProperty(this,"size");
        LocalContractStorage.defineProperty(this,"top10SucksMovies");
    };
    SucksMovieContract.prototype = {
        init: function () {
            this.size = 0;
        },
        getTop10:function(){
            return this.top10SucksMovies;
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
            LocalContractStorage.set("top10SucksMovies",top10);
            return top10;
        },
        save: function (movie_name, describe, date) {
            var score = 1;
            describe = describe.trim();
            movie_name = movie_name.trim();
            if (movie_name === ""){
                throw new Error("empty movie_name");
            }
            var from = Blockchain.transaction.from;
            var sucksMovie = this.repo.get(movie_name);
            if (sucksMovie){
                throw new Error("movie_name has been occupied");
            }
            sucksMovie = new SucksMovie();
            sucksMovie.author = from;
            sucksMovie.describe = describe;
            sucksMovie.movie_name = movie_name;
            sucksMovie.score = score;
            sucksMovie.date = date;
            this.repo.put(movie_name, sucksMovie);
            var index = this.size;
            this.arrayMap.set(index,movie_name);
            this.dataMap.set(movie_name,sucksMovie);
            this.size += 1;
            this.sort();
            return sucksMovie;
        },
        get: function (movie_name) {
            movie_name = movie_name.trim();
            if ( movie_name === "" ) {
                throw new Error("empty movie_name")
            }
            return this.repo.get(movie_name);
        },
        like:function(movie_name){
            if(movie_name){
                var sucksMovie = this.get(movie_name);
                var score = sucksMovie.score;
                score += 1;
                sucksMovie.score = score;
                this.dataMap.set(movie_name,sucksMovie);
                this.repo.set(movie_name,sucksMovie);
                this.sort();
                return sucksMovie;
            }else{
                throw new Error("input moive name is not valid");
            }
        },
        notlike:function(movie_name){
            if(movie_name){
                var sucksMovie = this.get(movie_name);
                var score = sucksMovie.score;
                score -= 1;
                if(score<0){
                    score = 0;
                }
                sucksMovie.score = score;
                this.dataMap.set(movie_name,sucksMovie);
                this.repo.put(movie_name,sucksMovie);
                this.sort();
                return sucksMovie;
            }else{
                throw new Error("input moive name is not valid");
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
                result[j] = '{"movie_name":"'+object.movie_name+'","describe":"'+object.describe+'","score:"'+object.score+'","author:"'+object.author+'","date":"'+object.date+'"}';
                j++;
            }
            return result;
        }
    };
    module.exports = SucksMovieContract;