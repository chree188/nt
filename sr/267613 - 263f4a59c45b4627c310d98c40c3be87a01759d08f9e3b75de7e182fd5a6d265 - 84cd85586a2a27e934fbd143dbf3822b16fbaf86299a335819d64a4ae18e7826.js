"use strict";

var Comment = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.pkid = obj.pkid;
        this.author = obj.author;
        this.filmName = obj.filmName;
        this.comment = obj.comment;
        this.submitTime = obj.submitTime;
        this.goodNum = obj.goodNum;
    } else {
        this.pkid = 0;
        this.author = "";
        this.filmName = "";
        this.comment = "";
        this.submitTime = "";
        this.goodNum = 0;
    }
};

Comment.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var Good = function(text) {
    if (text) {
        var obj = JSON.parse(text);
        this.goodId = obj.goodId;
        this.author = obj.author;
        this.commentId = obj.commentId;
    } else {
        this.goodId = 0;
        this.author = "";
        this.commentId = 0;
    }
};

Good.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var FilmReviewContract = function () {
   LocalContractStorage.defineMapProperty(this, "dataMap");
   LocalContractStorage.defineMapProperty(this, "goodMap");
   LocalContractStorage.defineProperty(this, "pkid");
   LocalContractStorage.defineProperty(this, "goodId");
};

FilmReviewContract.prototype = {
    init: function () {
        this.pkid = 0;
        this.goodId = 0;
    },

    saveComment: function (filmName, comment, submitTime) {
        var author = Blockchain.transaction.from;
        var pkid = this.pkid;
        var object = new Comment();
        object.pkid = pkid;
        object.author = author;
        object.filmName = filmName;
        object.comment = comment;
        object.submitTime = submitTime;
        object.goodNum = 0;
        
        this.dataMap.put(pkid,object);
        this.pkid += 1;
    },

    getAllComment: function () {
        //遍历goodMap中的所有值，算出每条评论的点赞数量
        var result  = [];
        for(var i=0; i<this.pkid; i++){
            var goodNum = 0;
            for(var j=0; j<this.goodId; j++){
                if(this.goodMap.get(j).commentId == i){
                    goodNum += 1;
                }
            }
            var object = this.dataMap.get(i);
            object.goodNum = goodNum;
            result.push(object);
        }
        return JSON.stringify(result);
    },

    len:function(){
      return this.pkid;
    },

    good:function (pkid) {
        var author = Blockchain.transaction.from;
        var goodId = this.goodId;
        var object = new Good();
        object.goodId = goodId;
        object.author = author;
        object.commentId = pkid;
        
        this.goodMap.put(goodId,object);
        this.goodId += 1;
    },

};

module.exports = FilmReviewContract;