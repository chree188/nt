

// TX Hash	80d7776f41ea02be98b9e6bb5f8116891a4148163c2ba759e469c245f34b3e95
// Contract address	n1k3mLs996c31AYqUhd2vAPpB754n4QUDu2

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

function lastInfo(infoArr) {
    var len = infoArr.length;
    if (len <= 0) {
        return 0;
    } else {
        return infoArr[len - 1];
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
    }
}

module.exports = MovieContract;

