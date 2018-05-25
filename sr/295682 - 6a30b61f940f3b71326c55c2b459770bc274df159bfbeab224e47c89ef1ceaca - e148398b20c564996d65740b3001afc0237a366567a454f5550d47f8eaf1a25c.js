"use strict";

let ReviewItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.from = obj.from;
        this.id = obj.id;
        this.content = obj.content;
        this.ts = obj.ts;
    } else {
        this.from = "";
        this.id = 0;
        this.content = "";
        this.ts = 0;
    }
};

ReviewItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

let SuperFilm = function () {
    LocalContractStorage.defineMapProperty(this, "userReviewNums"); // 用户评论数      {from: num}
    LocalContractStorage.defineMapProperty(this, "userReviewIndex"); // 用户评论索引    {from@num: txhash}

    LocalContractStorage.defineMapProperty(this, "movieReviewNums"); // 电影评论数     {id:num}
    LocalContractStorage.defineMapProperty(this, "movieReviewIndex"); // 电影评论索引    {id@num: txhash}

    LocalContractStorage.defineMapProperty(this, "reviewMap"); //评论    {txhash: reviewItem}
};

SuperFilm.prototype = {
    init: function () {
        return {
            "status": "OK",
            "message": "Deploy successful",
        };
    },

    // id:豆瓣电影id review:评论内容
    addReview: function (id, content) { //trim、判空 在 web里完成
        let from = Blockchain.transaction.from;
        let txhash = Blockchain.transaction.hash;
        let ts = Blockchain.transaction.timestamp;

        //获得 用户/电影 对应数量
        let userReviewNum = this.userReviewNums.get(from) - 0;
        let movieReviewNum = this.movieReviewNums.get(id) - 0;

        //更改 用户 对应数量/索引
        this.userReviewNums.set(from, userReviewNum + 1);
        this.userReviewIndex.set(from + "@" + userReviewNum, txhash);

        //更改 电影 对应数量/索引
        this.movieReviewNums.set(id, movieReviewNum + 1);
        this.movieReviewIndex.set(id + "@" + movieReviewNum, txhash);

        //添加 评论
        let reviewItem = new ReviewItem();
        reviewItem.from = from;
        reviewItem.id = id;
        reviewItem.content = content;
        reviewItem.ts = ts;
        this.reviewMap.set(txhash, reviewItem);

        return {
            "status": "OK"
        };
    },

    // from : 用户钱包地址
    showUserReview: function (from) { //trim、判空 在 web里完成
        from = from || "";

        if (from === "") {
            from = Blockchain.transaction.from;
        }

        let userReviewNum = this.userReviewNums.get(from);

        if (userReviewNum === 0 || userReviewNum === undefined) {
            return {
                "status": "ERROR",
                "message": "User never publish reviews!"
            };
        }

        userReviewNum = userReviewNum - 0;

        let results = new Array();
        for (let i = 0; i < userReviewNum; i++) {
            let txhash = this.userReviewIndex.get(from + "@" + i);
            results.push(this.reviewMap.get(txhash));
        }

        return {
            "status": "OK",
            "num": results.length,
            "data": results
        };
    },

    // id : 豆瓣电影id
    showMovieReview: function (id) { //trim、判空 在 web里完成
        let movieReviewNum = this.movieReviewNums.get(id);

        if (movieReviewNum === 0 || movieReviewNum === undefined) {
            return {
                "status": "ERROR",
                "message": "There is no review on the movie!"
            };
        }

        let results = new Array();
        for (let i = 0; i < movieReviewNum; i++) {
            let txhash = this.movieReviewIndex.get(id + "@" + i);
            results.push(this.reviewMap.get(txhash));
        }

        return {
            "status": "OK",
            "num": results.length,
            "data": results
        };
    },

};
module.exports = SuperFilm;