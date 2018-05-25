"use strict";

var Article = function(text) {
	if (text) {
        var obj = JSON.parse(text);
        this.postDate = obj.postDate;
		this.articleContent = obj.articleContent;
	} else {
        this.postDate = "";
		this.articleContent = "";
	}
};

Article.prototype = {
	toString: function () {
        return JSON.stringify(this);
      }
};

var TinyArticle = function () {
    // LocalContractStorage.defineMapProperty(this, "repo", {
    //     parse: function (text) {
    //         return new Article(text);
    //     },
    //     stringify: function (o) {
    //         return o.toString();
    //     }
    // });
    LocalContractStorage.defineMapProperty(this, "repo", null);
};

TinyArticle.prototype = {
    init: function () {
        // todo
    },

    postArticle: function (content) {
        content = content.trim();
        if (content === ""){
            throw new Error("empty value");
        };
        if (content.length > 200){
            throw new Error("key / value exceed limit length")
        };
        var author = Blockchain.transaction.from;
        // var localValue = this.repo.get(author);
        // LocalContractStorage.get(author)
        var articleList = LocalContractStorage.get(author);
        var article = new Article();
            article.postDate = (Date.now()).toString();
            article.articleContent = content;
        if (!articleList) {
            articleList = [];
            articleList.push(article);
        }
        else{
            articleList.push(article);
        };
        LocalContractStorage.set(author, articleList);
        // this.repo.put(author,articleList);
    },
    getAddressArticle: function(author){
        author = author.trim();
        if ( author === "" ) {
            throw new Error("empty key")
        }
        return LocalContractStorage.get(author);
        // return LocalContractStorage.get(author);
    }
};
module.exports = TinyArticle;