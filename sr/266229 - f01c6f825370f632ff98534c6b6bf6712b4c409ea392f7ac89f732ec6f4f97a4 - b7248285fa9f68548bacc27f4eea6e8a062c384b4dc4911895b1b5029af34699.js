"use strict";

var BottleContract = function () {
    LocalContractStorage.defineMapProperty(this, "bottleMap");
    LocalContractStorage.defineProperty(this, "bottleNum");
    LocalContractStorage.defineMapProperty(this, "likeModel");
};

BottleContract.prototype = {
    init: function () {
        this.bottleNum = 0;
    },

    newBottle: function (title, content) {
        var author = Blockchain.transaction.from;
        var index = this.bottleNum;
        var like = this.getIsClickLike(index,author)
        var likeNum = 1;
        var likeArr = newArray();
        this.bottleMap.set(index, {
            id: index,
            title: title,
            content: content,
            author: author,
            like: like,
            likeNum: likeNum
        });
        this.likeModel.set({
            id :index,
            likePerson: likeArr
        })
        this.bottleNum +=1;
    },
    getOneBottle: function (key) {
        return this.bottleMap.get(key);
    },
    getIsClickLike: function (index) {
        var likeModel = this.likeModel.get(index);
        var author = Blockchain.transaction.from;
        var isExsit = false;
        for (var temp in this.likeModel.likePerson) {
            if (author == temp){
                isExsit = true
            }
        }
        return isExsit;

    },
    ClickLike: function (index) {
        var likeModel = this.likeModel.get(index);
        var author = Blockchain.transaction.from;
        var likeArr = likeModel.likePerson;
        if (likeArr.length > 0) {
            var isExsit = this.getIsClickLike(index);
            if (isExsit) {
                likeArr.remove(author)
            }else {
                likeArr.push(author)
            }
        }else {
            likeArr.push(author)
        }
    },
    getLen:function(){
        return this.bottleNum;
    },
	getLikeArr:function(index) {
    	var likeModel = this.likeModel.get(index);
    	return likeModel.likePerson;
	}

};

module.exports = BottleContract;