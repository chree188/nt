"use strict";

var Danmuku = function () {
    LocalContractStorage.defineMapProperty(this, "movieMap");
};
Danmuku.prototype = {
    init: function () {
        var testComments = [];
        var number = 300;
        for(var i=0;i<number;i++){
            var time = Math.random() * 10 * i;
            var item = {time: parseFloat(time).toFixed(4), comment: "这是一条测试弹幕 "+i.toString()};
            testComments.push(item);
        }
        this.movieMap.set('test', testComments);
    },
    add: function (movie, time, comment) {
        var comments = this.get(movie);
        time = parseFloat(time);
        if(!comments){
            comments = [];
        }
        //from:Blockchain.transaction.from
        comments.push({time:time,comment: comment});
        movie = movie.toString().toLowerCase();
        this.movieMap.set(movie, comments);
    },
    get: function(movie) { 
        if(movie){
            movie = movie.toString().toLowerCase();
            var comments = this.movieMap.get(movie);
            if(!comments){
                comments = [];
            }
            return comments;
        }else{
            return null;
        }
    }
};
module.exports = Danmuku;