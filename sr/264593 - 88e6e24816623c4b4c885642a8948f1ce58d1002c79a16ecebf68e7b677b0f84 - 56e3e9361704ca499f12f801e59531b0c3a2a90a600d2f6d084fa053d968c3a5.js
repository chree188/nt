
// TX Hash	dbd6ea35fceef121f28c9e6a30fc9abf1fd193a55533a88d006a874b4e681d00
// Contract address	n1qFELY9hFPqDzj5yHBX5qm4YGSRa7LcC3h

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
            author:from
        });
        movie.comments = JSON.stringify(commentArr)
        this.commentDB.put(movieId,movie);
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
    }
}

module.exports = MovieContract;

