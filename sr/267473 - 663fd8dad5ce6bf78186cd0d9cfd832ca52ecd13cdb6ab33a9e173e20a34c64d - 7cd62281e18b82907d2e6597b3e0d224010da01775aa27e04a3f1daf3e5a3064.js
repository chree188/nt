// TX Hash	55d44648884410f6feaf5b11bf97b2f01ce8b77fa7cd049361521b1a0457c5ca
// Contract address	n1uj8vSyXHMMFZqhcWSio6WAw9hEy9CSkij
'use strict';

var CommentItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.comments = obj.comments;
        // this.author = obj.author;
        // this.star = obj.star;
    } else {
        this.comments = "[]";
        // this.author = "";
        // this.star = 0;
    }
};

CommentItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var StarItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.stars = obj.stars;
        // this.author = obj.author;
        // this.star = obj.star;
    } else {
        this.stars = "[]";
        // this.author = "";
        // this.star = 0;
    }
};

StarItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

function isStarBefore(infoArr,from) {
    var len = infoArr.length;
    if (len <= 0) {
        return false;
    } else {
        for (var index in infoArr) {
            var info = infoArr[index];
            if (info.author == from) {
                return true;
            }
        }
        return false;
    }
}

var MovieContract = function () {
    LocalContractStorage.defineMapProperty(this, 'commentDB', {
        parse: function (str) {
            return new CommentItem(str);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineMapProperty(this, 'starDB', {
        parse: function (str) {
            return new StarItem(str);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};
MovieContract.prototype = {
    init: function () {},
    saveComment: function (movieId,comment) {
        comment = comment.trim();
        movieId = movieId.trim();
        if (comment.length <= 0) {
            throw new Error('评论内容不能为空！');
        }
        if (movieId.length <= 0) {
            throw new Error('电影 ID 不能为空！');
        }
        var from = Blockchain.transaction.from;
        var movie = this.commentDB.get(movieId);
        if (!movie) {
            movie = new CommentItem(null)
        }
        var commentArr = JSON.parse(movie.comments);
        commentArr.push({
            comment: comment,
            author:from,
            time:new Date().getTime()+''
        });
        movie.comments = JSON.stringify(commentArr)
        this.commentDB.put(movieId,movie);
    },
    // 存储评分
    saveStar: function (movieId,star) {
        star = star.trim();
        movieId = movieId.trim();
        if (star.length <= 0) {
            throw new Error('评分不能为空！');
        }
        if (movieId.length <= 0) {
            throw new Error('电影 ID 不能为空！');
        }
        var from = Blockchain.transaction.from;
        var movie = this.starDB.get(movieId);
        if (!movie) {
            movie = new StarItem(null)
        }
        var starArr = JSON.parse(movie.stars);
        if (isStarBefore(starArr,from)) {
            throw new Error('您已评分了哦！');
        }
        starArr.push({
            star: star,
            author:from,
            time:new Date().getTime()+''
        });
        movie.stars = JSON.stringify(starArr)
        this.starDB.put(movieId,movie);
    },
    historyOfComment: function (movieId) {
        movieId = movieId.trim();
        if (movieId.length <= 0) {
            throw new Error('电影 ID 不能为空！');
        }
        var from = Blockchain.transaction.from;
        var movie = this.commentDB.get(movieId);
        if (!movie) {
            movie = new CommentItem(null)
        }
        return movie ? movie.toString() : '';
    },
    historyOfStar: function (movieId) {
        movieId = movieId.trim();
        if (movieId.length <= 0) {
            throw new Error('电影 ID 不能为空！');
        }
        var from = Blockchain.transaction.from;
        var movie = this.starDB.get(movieId);
        if (!movie) {
            movie = new StarItem(null)
        }
        return movie ? movie.toString() : '';
    },
    isStarBefore:function (movieId) {
        movieId = movieId.trim();
        if (movieId.length <= 0) {
            throw new Error('电影 ID 不能为空！');
        }
        var from = Blockchain.transaction.from;
        var movie = this.starDB.get(movieId);
        if (!movie) {
            movie = new StarItem(null)
        }
        var starArr = JSON.parse(movie.stars);
        return isStarBefore(starArr,from);
    }
}

module.exports = MovieContract;

